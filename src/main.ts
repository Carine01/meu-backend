import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import { CorrelationInterceptor } from './shared/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Logger estruturado
  app.useLogger(app.get(PinoLogger));

  // Correlation ID para rastreamento de requisições
  app.useGlobalInterceptors(new CorrelationInterceptor());

  // SEGURANÇA: Helmet - protege contra vulnerabilidades conhecidas
  app.use(helmet());

  // SEGURANÇA: CORS restritivo
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    maxAge: 3600,
  });

  // SEGURANÇA: Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Rejeita requisições com props extras
      transform: true, // Transforma payloads para instâncias de DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Graceful shutdown
  const logger = app.get(PinoLogger);
  app.enableShutdownHooks();
  
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM recebido, encerrando aplicação...');
    await app.close();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  logger.log(`🔒 Security: Helmet, CORS, ValidationPipe ativados`);
}

bootstrap().catch((error) => {
  console.error('❌ Erro fatal na inicialização:', error);
  process.exit(1);
});

