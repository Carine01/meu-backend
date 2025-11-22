import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FilaService } from './fila.service';
import { MensagensModule } from '../mensagens/mensagens.module';

/**
 * Módulo de Fila de Envio WhatsApp
 * 
 * Funcionalidades:
 * - Adicionar mensagens na fila com agendamento
 * - Processar fila com retry automático
 * - Integração com webhook Make.com/Zapier
 * 
 * Depende de:
 * - MensagensModule (resolução de templates)
 * - HttpModule (envio via webhook)
 * - ConfigModule (variáveis de ambiente)
 */
@Module({
  imports: [HttpModule, ConfigModule, MensagensModule],
  providers: [FilaService],
  exports: [FilaService],
})
export class FilaModule {}

