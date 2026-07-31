import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration, JoiValidationSchema } from './config/env.config';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [EnvConfiguration],
    validationSchema: JoiValidationSchema
  }), StorageModule],
  controllers: [],
  providers: [],
})
export class AppModule { }