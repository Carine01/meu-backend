import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppController } from './controllers/whatsapp.controller';
import { WhatsAppService } from './services/whatsapp.service';
import { FilaService } from './services/fila.service';

/**
 * WhatsAppModule - Complete WhatsApp integration module
 * Ready to be imported into AppModule
 * 
 * Features:
 * - Baileys integration for WhatsApp messaging
 * - Message queueing with PQueue
 * - Session persistence (auth_info_baileys)
 * - clinicId multitenancy support
 * - Swagger documentation
 * - Validation with class-validator
 * 
 * Configuration required:
 * - WHATSAPP_AUTH_PATH (optional, defaults to ./auth_info_baileys)
 * - DEFAULT_CLINIC (optional, fallback clinicId)
 * 
 * Usage:
 * Import this module in AppModule:
 * 
 * @Module({
 *   imports: [
 *     // ... other imports
 *     WhatsAppModule,
 *   ],
 * })
 * export class AppModule {}
 */
@Module({
  imports: [ConfigModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    FilaService,
  ],
  exports: [WhatsAppService, FilaService],
})
export class WhatsAppModule {}
