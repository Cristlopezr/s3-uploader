import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/env.config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [EnvConfiguration]
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
