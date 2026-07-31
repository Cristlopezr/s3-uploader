import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePresignedUploadUrlDto } from './dto/create-presigned-upload-url.dto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { InjectModel } from '@nestjs/mongoose';
import { File } from './schemas/file-schema.schema';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {


  constructor(@Inject('S3_CLIENT') private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
    @InjectModel(File.name) private readonly fileModel: Model<File>) { }

  async createPresignedUploadUrl({ contentType, fileName }: CreatePresignedUploadUrlDto) {

    const s3FileName = uuid()

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('bucket_name'),
      Key: `${this.configService.get('file_key_base')}/${s3FileName}`,
      ContentType: contentType
    })

    try {
      await this.fileModel.create({ originalName: fileName, s3Name: s3FileName });
      return await getSignedUrl(this.s3Client, command, { expiresIn: this.configService.get<number>('presigned_url_expires_in') })
    } catch (error) {
      console.log('Error generating presigned Url ' + error)
      throw new InternalServerErrorException('Error generating presigned Url')
    }
  }

  async createPresignedGetUrl(id: string) {

    const file = await this.fileModel.findById(id);
    if (!file) throw new NotFoundException('File not found')

    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('bucket_name'),
      Key: `${this.configService.get('file_key_base')}/${file.s3Name}`,
    })
    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn: this.configService.get<number>('presigned_url_expires_in') })
    } catch (error) {
      console.log('Error generating presigned Url ' + error)
      throw new InternalServerErrorException('Error generating presigned Url')
    }
  }
}
