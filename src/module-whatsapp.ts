import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppMessage } from './entities/whatsapp-message.entity';
import { WhatsAppService } from './services/whatsapp.service';
import { FilaService } from './services/fila.service';
import { WhatsAppController } from './controllers/whatsapp.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsAppMessage])],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, FilaService],
  exports: [WhatsAppService, FilaService],
})
export class WhatsAppModule {}
