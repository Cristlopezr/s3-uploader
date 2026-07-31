import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreatePresignedUploadUrlDto } from './dto/create-presigned-upload-url.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) { }

  @Post('upload-url')
  createPresignedUploadUrl(@Body() dto: CreatePresignedUploadUrlDto) {
    return this.storageService.createPresignedUploadUrl(dto);
  }

  @Get('download-url')
  getPresignedGetUrl(@Query('id', ParseMongoIdPipe) id: string) {
    return this.storageService.createPresignedGetUrl(id);
  }
}
