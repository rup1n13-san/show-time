import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // binding ValidationPipe at the application level, thus ensuring all endpoints are protected from receiving incorrect data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //to ignore unwanted field in the body request
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors();
  //app.use(methodOverride('_method'));

  await app.listen(process.env.PORT ?? 3000);
  //console.log('Application lancée sur http://localhost:3000');
}
bootstrap();
