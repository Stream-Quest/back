import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.useGlobalFilters(new PrismaExceptionFilter(), new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Maengdok Stream Quest API')
    .setDescription('Real-time TTRPG event engine driven by Twitch viewers')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  if (process.env.GENERATE_SWAGGER === 'true') {
    writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
    console.log('✅ swagger.json generated');
    await app.close();
    process.exit(0);
  }

  await app.listen(process.env.PORT ?? 3999);
}

void bootstrap();
