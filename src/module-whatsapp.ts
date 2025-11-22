/**
 * Barrel export para WhatsApp Module
 * Facilita importação no AppModule
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
 */
export { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
export { WhatsAppService } from './modules/whatsapp/whatsapp.service';
export { WhatsAppController } from './modules/whatsapp/whatsapp.controller';
export { WhatsAppMessage } from './entities/whatsapp-message.entity';
export { SendWhatsAppDto, SendWhatsAppResponseDto, WhatsAppHealthDto } from './dto/send-whatsapp.dto';
