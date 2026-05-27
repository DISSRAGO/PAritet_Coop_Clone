import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('BACKEND_PORT');
  const host = configService.get<string>('APP_HOST');
  const globalPrefix = configService.get<string>('END_POINT');
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  app.setViewEngine('hbs');
  const options = new DocumentBuilder()
    .setTitle('ui')
    .setDescription('description')
    .setVersion('v')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${globalPrefix}/swagger`, app, document);

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(`Swagger UI: http://localhost:${port}/${globalPrefix}/swagger`);
}

bootstrap();
