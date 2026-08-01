import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreatePresignedUploadUrlDto } from './dto/create-presigned-upload-url.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) { }

  @Post('files/upload-url')
  createPresignedUploadUrl(@Body() dto: CreatePresignedUploadUrlDto) {
    return this.storageService.createPresignedUploadUrl(dto);
  }

  @Get('files/:id/download-url')
  getPresignedGetUrl(@Param('id', ParseMongoIdPipe) id: string) {
    return this.storageService.createPresignedDownloadUrl(id);
  }

  @Get('files/:id')
  getFileById(@Param('id', ParseMongoIdPipe) id: string) {
    return this.storageService.getFileById(id)
  }

  @Get('files')
  getAllFiles() {
    return this.storageService.getAllFiles();
  }
}
