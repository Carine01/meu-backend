import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

/**
 * Módulo de gerenciamento de perfis de clínicas
 */
@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService], // Exporta para ser usado em outros módulos
})
export class ProfileModule {}

