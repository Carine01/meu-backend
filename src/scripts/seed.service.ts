import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bloqueio } from '../modules/agendamentos/entities/bloqueio.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Bloqueio)
    private bloqueioRepo: Repository<Bloqueio>,
  ) {}

  async seed() {
    this.logger.log('🌱 Iniciando seed do banco de dados...');

    await this.seedBloqueios();

    this.logger.log('✅ Seed concluído!');
  }

  private async seedBloqueios() {
    const clinicId = 'ELEVARE_MAIN';

    // Bloqueios de almoço (próximos 30 dias, segunda a sexta, 12h-14h)
    for (let i = 0; i < 30; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      const diaSemana = data.getDay();

      if (diaSemana >= 1 && diaSemana <= 5) {
        const bloqueio = this.bloqueioRepo.create({
          clinicId,
          data: data.toISOString().split('T')[0],
          startTime: '12:00',
          endTime: '14:00',
          tipo: 'almoco',
          motivo: 'Horário de almoço',
          recorrente: false,
        });

        await this.bloqueioRepo.save(bloqueio);
      }

      // Bloqueio de sábado tarde (após 14h)
      if (diaSemana === 6) {
        const bloqueio = this.bloqueioRepo.create({
          clinicId,
          data: data.toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '23:59',
          tipo: 'sabado',
          motivo: 'Sábado funciona apenas até 14h',
          recorrente: false,
        });

        await this.bloqueioRepo.save(bloqueio);
      }
    }

    // Feriados nacionais 2025
    const feriados = [
      { data: '2025-01-01', nome: 'Ano Novo' },
      { data: '2025-04-21', nome: 'Tiradentes' },
      { data: '2025-05-01', nome: 'Dia do Trabalho' },
      { data: '2025-09-07', nome: 'Independência do Brasil' },
      { data: '2025-10-12', nome: 'Nossa Senhora Aparecida' },
      { data: '2025-11-02', nome: 'Finados' },
      { data: '2025-11-15', nome: 'Proclamação da República' },
      { data: '2025-12-25', nome: 'Natal' },
    ];

    for (const feriado of feriados) {
      const bloqueio = this.bloqueioRepo.create({
        clinicId,
        data: feriado.data,
        startTime: '00:00',
        endTime: '23:59',
        tipo: 'feriado',
        motivo: `Feriado: ${feriado.nome}`,
        recorrente: true,
        ateData: '2026-01-01',
      });

      await this.bloqueioRepo.save(bloqueio);
    }

    this.logger.log(`✅ Bloqueios criados: ${30 + 8} registros`);
  }
}

