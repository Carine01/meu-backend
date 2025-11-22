import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicacoesService } from './indicacoes.service';
import { IndicacoesController } from './indicacoes.controller';
import { Indicacao } from './entities/indicacao.entity';
import { Recompensa } from './entities/recompensa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Indicacao, Recompensa])],
  controllers: [IndicacoesController],
  providers: [IndicacoesService],
  exports: [IndicacoesService],
})
export class IndicacoesModule {}

