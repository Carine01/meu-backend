import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { BaileysProvider } from './baileys.provider';
import { WhatsAppOfficialProvider } from './whatsapp-official.provider';
import { MockWhatsAppProvider } from './mock.provider';

@Module({
  imports: [ConfigModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    {
      provide: 'WHATSAPP_PROVIDER',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('WHATSAPP_PROVIDER', 'mock');
        
        if (provider === 'official') {
          return new WhatsAppOfficialProvider(configService);
        }
        
        if (provider === 'baileys') {
          // Baileys provider for MVP
          const baileysProvider = new BaileysProvider();
          baileysProvider.initialize(); // Initialize connection
          return baileysProvider;
        }
        
        // Default: Mock provider for testing/development
        return new MockWhatsAppProvider();
      },
      inject: [ConfigService],
    },
  ],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

