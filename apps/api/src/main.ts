import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  const configService = app.get(ConfigService)
  app.enableCors(({
    origin: configService.getOrThrow<string[]>('allowed_origins'),
    methods: 'GET,POST'
  }))

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))

  /*  app.useGlobalInterceptors(
     new ClassSerializerInterceptor(app.get(Reflector))
   ) */

  const port = configService.getOrThrow<number>('port')
  await app.listen(port);
}
bootstrap();
