import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../modules/auth/auth.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SeedAdmin');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  try {
    await authService.seedAdminUser();
    logger.log('✅ Admin seed executado com sucesso!');
    logger.warn('📧 Email: admin@elevare.com');
    logger.warn('🔑 Senha: admin123');
    logger.warn('⚠️  ALTERE A SENHA EM PRODUÇÃO!');
  } catch (error: any) {
    logger.error('❌ Erro ao criar admin:', error.message);
  }

  await app.close();
  process.exit(0);
}

bootstrap();

