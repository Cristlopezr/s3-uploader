import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfiguration, JoiValidationSchema } from './config/env.config';
import { StorageModule } from './storage/storage.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [EnvConfiguration],
    validationSchema: JoiValidationSchema
  },), StorageModule, MongooseModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      uri: configService.get<string>('mongo_uri')
    }),
    inject: [ConfigService]
  })],
  controllers: [],
  providers: [],
})
export class AppModule { }