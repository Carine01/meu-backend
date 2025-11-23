import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { BaileysProvider } from './baileys.provider';
import { WhatsAppOfficialProvider } from './whatsapp-official.provider';
import { WhatsappMessage } from './entities/whatsapp-message.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([WhatsappMessage]),
  ],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    {
      provide: 'WHATSAPP_PROVIDER',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('WHATSAPP_PROVIDER', 'baileys');
        
        if (provider === 'official') {
          return new WhatsAppOfficialProvider(configService);
        }
        
        // Default: Baileys para MVP
        const baileysProvider = new BaileysProvider();
        baileysProvider.initialize(); // Inicia conexão
        return baileysProvider;
      },
      inject: [ConfigService],
    },
  ],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

