import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { FirebaseAuthService } from '../firebase-auth.service';

/**
 * Módulo de gerenciamento de perfis de clínicas
 */
@Module({
  controllers: [ProfileController],
  providers: [ProfileService, FirebaseAuthService],
  exports: [ProfileService], // Exporta para ser usado em outros módulos
})
export class ProfileModule {}

