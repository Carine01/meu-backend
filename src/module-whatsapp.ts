import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppController } from './controllers/whatsapp.controller';
import { WhatsAppService } from './services/whatsapp.service';
import { FilaService } from './services/fila.service';

/**
 * WhatsAppModule
 * 
 * Módulo completo para integração WhatsApp via Baileys
 * 
 * Features:
 * - Envio de mensagens com enfileiramento
 * - Persistência de sessão WhatsApp
 * - Suporte a multitenancy (clinicId)
 * - Health check e estatísticas
 * 
 * Para usar, importe este módulo no AppModule:
 * 
 * @example
 * ```typescript
 * import { WhatsAppModule } from './module-whatsapp';
 * 
 * @Module({
 *   imports: [
 *     // ... outros módulos
 *     WhatsAppModule,
 *   ],
 * })
 * export class AppModule {}
 * ```
 * 
 * Variáveis de ambiente necessárias:
 * - WHATSAPP_AUTH_PATH: Caminho para persistir auth/sessão (padrão: ./whatsapp-auth)
 */
@Module({
  imports: [ConfigModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    FilaService,
  ],
  exports: [WhatsAppService, FilaService], // Exportar para uso em outros módulos
})
export class WhatsAppModule {}
