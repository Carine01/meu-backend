import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Logger estruturado
  app.useLogger(app.get(PinoLogger));

  // GLOBAL: Exception filter para respostas de erro padronizadas
  app.useGlobalFilters(new AllExceptionsFilter());

  // GLOBAL: Logging interceptor para monitoramento de requisições
  app.useGlobalInterceptors(new LoggingInterceptor());

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

  // API Documentation (Swagger)
  const config = new DocumentBuilder()
    .setTitle('Elevare Atendimento API')
    .setDescription('API Backend para sistema de atendimento e gestão de leads')
    .setVersion('1.0')
    .addTag('leads', 'Gestão de leads e contatos')
    .addTag('health', 'Verificação de saúde da aplicação')
    .addTag('firestore', 'Operações no Firestore')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

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
  logger.log(`📚 API Documentation: http://0.0.0.0:${port}/api/docs`);
  logger.log(`🔒 Security: Helmet, CORS, ValidationPipe ativados`);
}

bootstrap().catch((error) => {
  console.error('❌ Erro fatal na inicialização:', error);
  process.exit(1);
});
