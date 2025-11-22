import { Module } from '@nestjs/common';
import { AgendaSemanalService } from './agenda-semanal.service';
import { FilaModule } from '../fila/fila.module';

/**
 * Módulo de Campanhas e Automações
 * 
 * Funcionalidades:
 * - Agenda semanal automatizada (Segunda-Domingo)
 * - Disparos por etiquetas
 * - Regras de negócio por dia da semana
 * 
 * Depende de:
 * - FilaModule (adição de mensagens na fila)
 */
@Module({
  imports: [FilaModule],
  providers: [AgendaSemanalService],
  exports: [AgendaSemanalService],
})
export class CampanhasModule {}

