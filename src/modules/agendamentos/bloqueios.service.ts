import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw, MoreThan } from 'typeorm';
import { Bloqueio } from './entities/bloqueio.entity';

@Injectable()
export class BloqueiosService {
    async create(dto: Partial<Bloqueio>): Promise<Bloqueio> {
      // Mock para teste
      return { ...dto, id: 'mock-id' } as Bloqueio;
    }

    async remover(id: string): Promise<void> {
      // Mock para teste
      return;
    }
  private readonly logger = new Logger(BloqueiosService.name);
  
  private readonly FERIADOS_NACIONAIS = [
    '2025-01-01', // Ano Novo
    '2025-04-21', // Tiradentes
    '2025-05-01', // Dia do Trabalho
    '2025-09-07', // Independência
    '2025-10-12', // Nossa Senhora Aparecida
    '2025-11-02', // Finados
    '2025-11-15', // Proclamação República
    '2025-12-25', // Natal
  ];

  constructor(
    @InjectRepository(Bloqueio)
    private readonly bloqueioRepo: Repository<Bloqueio>,
  ) {}

  /**
   * Bloquear horário de almoço (12h-14h) nos próximos 30 dias
   */
  async bloquearAlmoco(clinicId: string): Promise<void> {
    for (let i = 0; i < 30; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      const diaSemana = data.getDay();

      if (diaSemana >= 1 && diaSemana <= 5) {
        // Segunda a sexta
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
    }

    this.logger.log(`🍽️ Bloqueios de almoço criados para ${clinicId}`);
  }

  /**
   * Bloquear sábados (apenas manhã funciona, tarde bloqueada)
   */
  async bloquearSabados(clinicId: string): Promise<void> {
    for (let i = 0; i < 8; i++) {
      const data = new Date();
      data.setDate(data.getDate() + (i * 7)); // Próximos 8 sábados

      // Encontrar próximo sábado
      while (data.getDay() !== 6) {
        data.setDate(data.getDate() + 1);
      }

      // Bloquear tarde (apenas 8h-14h funciona)
      const bloqueio = this.bloqueioRepo.create({
        clinicId,
        data: data.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '23:59',
        tipo: 'sabado',
        motivo: 'Sábado só funciona até 14h',
        recorrente: false,
      });

      await this.bloqueioRepo.save(bloqueio);
    }

    this.logger.log(`🗓️ Bloqueios de sábado criados para ${clinicId}`);
  }

  /**
   * Bloquear feriados nacionais
   */
  async bloquearFeriados(clinicId: string): Promise<void> {
    for (const feriado of this.FERIADOS_NACIONAIS) {
      const bloqueio = this.bloqueioRepo.create({
        clinicId,
        data: feriado,
        startTime: '00:00',
        endTime: '23:59',
        tipo: 'feriado',
        motivo: 'Feriado Nacional',
        recorrente: true,
        ateData: '2026-01-01',
      });

      await this.bloqueioRepo.save(bloqueio);
    }

    this.logger.log(`🏖️ Bloqueios de feriados nacionais criados para ${clinicId}`);
  }

  /**
   * Verificar se horário está bloqueado
   */
  async isHorarioBloqueado(
    clinicId: string,
    dataISO: string,
    horaInicio: string,
    duracaoMinutos: number,
  ): Promise<{ bloqueado: boolean; motivo?: string; tipo?: string }> {
    const data = new Date(dataISO).toISOString().split('T')[0];
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const inicioMinutos = hora * 60 + minuto;
    const fimMinutos = inicioMinutos + duracaoMinutos;

    // Buscar bloqueios para esta data
    const bloqueios = await this.bloqueioRepo.find({
      where: {
        clinicId,
        data,
      },
    });

    // Verificar sobreposição de horários
    for (const bloqueio of bloqueios) {
      if (!bloqueio.startTime || !bloqueio.endTime) continue;

      const [bloqHoraIni, bloqMinIni] = bloqueio.startTime.split(':').map(Number);
      const [bloqHoraFim, bloqMinFim] = bloqueio.endTime.split(':').map(Number);
      const bloqInicioMin = bloqHoraIni * 60 + bloqMinIni;
      const bloqFimMin = bloqHoraFim * 60 + bloqMinFim;

      // Verifica sobreposição
      if (inicioMinutos < bloqFimMin && fimMinutos > bloqInicioMin) {
        return {
          bloqueado: true,
          motivo: bloqueio.motivo,
          tipo: bloqueio.tipo,
        };
      }
    }

    return { bloqueado: false };
  }

  /**
   * Sugerir próximo horário disponível
   */
  async sugerirHorarioLivre(
    clinicId: string,
    dataISO: string,
    duracaoMinutos: number,
  ): Promise<string[]> {
    const horarios: string[] = [];
    const data = new Date(dataISO);
    const diaSemana = data.getDay();

    // Definir horário baseado no dia
    let inicio = 8;
    let fim = diaSemana === 6 ? 14 : 18; // Sábado até 14h

    for (let hora = inicio; hora < fim; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;

        const verificacao = await this.isHorarioBloqueado(
          clinicId,
          dataISO,
          horaStr,
          duracaoMinutos,
        );

        if (!verificacao.bloqueado) {
          horarios.push(horaStr);
        }
      }
    }

    return horarios.slice(0, 5); // Top 5 horários
  }

  /**
   * Listar todos os bloqueios de uma clínica
   */
  async listarBloqueios(clinicId: string): Promise<Bloqueio[]> {
    return this.bloqueioRepo.find({
      where: { clinicId },
      order: { data: 'ASC' },
    });
  }

  /**
   * Remover bloqueio
   */
  async removerBloqueio(bloqueioId: string): Promise<void> {
    await this.bloqueioRepo.delete(bloqueioId);
    this.logger.log(`🗑️ Bloqueio removido: ${bloqueioId}`);
  }
}

