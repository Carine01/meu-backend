import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';
import { BloqueiosService } from './bloqueios.service';
import { Agendamento } from './entities/agendamento.entity';
import { Bloqueio } from './entities/bloqueio.entity';
import { forwardRef } from '@nestjs/common';
import { LeadsModule } from '../../leads/leads.module';
import { FilaModule } from '../fila/fila.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agendamento, Bloqueio]),
    LeadsModule,
    FilaModule,
  ],
  controllers: [AgendamentosController],
  providers: [AgendamentosService, BloqueiosService],
  exports: [AgendamentosService, BloqueiosService],
})
export class AgendamentosModule {}

