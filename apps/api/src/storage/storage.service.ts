import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePresignedUploadUrlDto } from './dto/create-presigned-upload-url.dto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

@Injectable()
export class StorageService {


  constructor(@Inject('S3_CLIENT') private readonly s3Client: S3Client,
    private readonly configService: ConfigService) { }

  async createPresignedUploadUrl(createPresignedUploadUrlDto: CreatePresignedUploadUrlDto) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('bucket_name'),
      Key: `${this.configService.get('file_key_base')}/${createPresignedUploadUrlDto.fileName}`,
      ContentType: createPresignedUploadUrlDto.contentType
    })

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn: this.configService.get<number>('presigned_url_expires_in') })
    } catch (error) {
      console.log('Error generating presigned Url ' + error)
      throw new InternalServerErrorException('Error generating presigned Url')
    }
  }

  async createPresignedGetUrl(fileName: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('bucket_name'),
      Key: `${this.configService.get('file_key_base')}/${fileName}`,
    })

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn: this.configService.get<number>('presigned_url_expires_in') })
    } catch (error) {
      console.log('Error generating presigned Url ' + error)
      throw new InternalServerErrorException('Error generating presigned Url')
    }
  }
}
