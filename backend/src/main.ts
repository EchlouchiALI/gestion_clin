import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Autoriser le frontend React sur http://localhost:3000
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // ✅ Écoute sur le port 3001 pour éviter les conflits avec le frontend
  await app.listen(3001);
}
bootstrap();
