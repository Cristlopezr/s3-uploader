import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePresignedUploadUrlDto } from './dto/create-presigned-upload-url.dto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { InjectModel } from '@nestjs/mongoose';
import { File, FileStatus } from './schemas/file-schema.schema';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { FileResponseDto } from './dto/file-response.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class StorageService {


  constructor(@Inject('S3_CLIENT') private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
    @InjectModel(File.name) private readonly fileModel: Model<File>) { }

  async createPresignedUploadUrl({ contentType, fileName, size }: CreatePresignedUploadUrlDto) {


    const s3FileKey = `${this.configService.get('file_key_base')}/${uuid()}`;

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('bucket_name'),
      Key: s3FileKey,
      ContentType: contentType
    })

    try {
      const createdFile = await this.fileModel.create({ originalName: fileName, s3FileKey, contentType, size, status: FileStatus.PENDING });
      const file = instanceToPlain(new FileResponseDto(createdFile.toObject()), { strategy: 'excludeAll' });
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: this.configService.get<number>('presigned_url_expires_in') })
      return {
        presignedUrl,
        file,
      }
    } catch (error) {
      console.log('Error generating presigned Url ' + error)
      throw new InternalServerErrorException('Error generating presigned Url')
    }
  }

  async createPresignedDownloadUrl(id: string) {

    const file = await this.findOneFileById(id);

    if (file.status !== FileStatus.ACTIVE) throw new BadRequestException('File is not active')

    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('bucket_name'),
      Key: file.s3FileKey,
      ResponseContentDisposition: `inline; filename="${file.originalName}"`,
      /* ResponseContentDisposition: `attachment; filename="${file.originalName}"` */
      ResponseContentType: file.contentType
    })
    try {
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: this.configService.get<number>('presigned_url_expires_in') })
      return {
        presignedUrl
      }
    } catch (error) {
      console.log('Error generating presigned Url ' + error)
      throw new InternalServerErrorException('Error generating presigned Url')
    }
  }

  async getFileById(id: string) {
    const file = await this.findOneFileById(id);
    return instanceToPlain(new FileResponseDto(file.toObject()), { strategy: 'excludeAll' })
  }

  async getAllFiles() {
    const files = await this.fileModel.find({
      status: FileStatus.ACTIVE
    });
    return files.map((file) => instanceToPlain(new FileResponseDto(file.toObject()), { strategy: 'excludeAll' }))
  }

  private async findOneFileById(id: string) {
    const file = await this.fileModel.findById(id);
    if (!file) throw new NotFoundException('File not found')
    return file;
  }
}
