import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const configService = app.get(AppConfigService);

    // Enable CORS for frontend communication
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Enable validation pipes
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Set global prefix for API routes
    app.setGlobalPrefix('api');

    const port = configService.port;
    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 DEX Trading Bot Backend is running on port ${port}`);
    logger.log(`📊 Environment: ${configService.nodeEnv}`);
    logger.log(`🔗 WebSocket endpoint: ws://localhost:${port}/trading`);
    logger.log(`🌐 API endpoint: http://localhost:${port}/api`);

  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();

