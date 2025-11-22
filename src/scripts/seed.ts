import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seed();
    console.log('✅ Seed executado com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();

