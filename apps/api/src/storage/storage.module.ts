import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  controllers: [StorageController],
  providers: [StorageService,
    {
      provide: 'S3_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          region: configService.get<string>('bucket_region')
        })
      },
      inject: [ConfigService]
    }
  ],
})
export class StorageModule { }
