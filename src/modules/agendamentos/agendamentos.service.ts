import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agendamento } from './entities/agendamento.entity';

@Injectable()
export class AgendamentosService {
  private readonly logger = new Logger(AgendamentosService.name);

  constructor(
    @InjectRepository(Agendamento)
    private readonly agendamentoRepo: Repository<Agendamento>,
  ) {}

  /**
   * Criar novo agendamento
   */
  async criarAgendamento(dados: Partial<Agendamento>): Promise<Agendamento> {
    const agendamento = this.agendamentoRepo.create(dados);
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(
      `✅ Agendamento criado: ${agendamento.id} | ${agendamento.nomePaciente} | ${agendamento.startISO}`,
    );

    return agendamento;
  }

  /**
   * Confirmar agendamento
   */
  async confirmarAgendamento(id: string): Promise<void> {
    const agendamento = await this.agendamentoRepo.findOne({ where: { id } });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    agendamento.status = 'confirmado';
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(`✅ Agendamento confirmado: ${id}`);
  }

  /**
   * Cancelar agendamento
   */
  async cancelarAgendamento(id: string, motivo?: string): Promise<void> {
    const agendamento = await this.agendamentoRepo.findOne({ where: { id } });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    agendamento.status = 'cancelado';
    if (motivo) {
      agendamento.observacoes = `Cancelado: ${motivo}`;
    }
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(`❌ Agendamento cancelado: ${id} | Motivo: ${motivo}`);
  }

  /**
   * Marcar comparecimento
   */
  async marcarComparecimento(id: string): Promise<void> {
    const agendamento = await this.agendamentoRepo.findOne({ where: { id } });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    agendamento.status = 'compareceu';
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(`✅ Comparecimento registrado: ${id}`);
  }

  /**
   * Marcar no-show (falta)
   */
  async marcarNoShow(id: string): Promise<void> {
    const agendamento = await this.agendamentoRepo.findOne({ where: { id } });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    agendamento.status = 'no-show';
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(`⚠️ No-show registrado: ${id}`);
  }

  /**
   * Reagendar
   */
  async reagendar(id: string, novoStartISO: string): Promise<void> {
    const agendamento = await this.agendamentoRepo.findOne({ where: { id } });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    const antigoHorario = agendamento.startISO;
    agendamento.startISO = novoStartISO;
    agendamento.status = 'agendado';
    agendamento.observacoes = `Reagendado de ${antigoHorario} para ${novoStartISO}`;

    await this.agendamentoRepo.save(agendamento);

    this.logger.log(`🔄 Agendamento reagendado: ${id} | Novo horário: ${novoStartISO}`);
  }

  /**
   * Buscar agendamento por ID
   */
  async findById(id: string): Promise<Agendamento> {
    const agendamento = await this.agendamentoRepo.findOne({ where: { id } });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    return agendamento;
  }

  /**
   * Listar todos agendamentos
   */
  async findAll(): Promise<Agendamento[]> {
    return this.agendamentoRepo.find({
      order: { startISO: 'ASC' },
    });
  }
  /**
   * Lista agendamentos filtrando por clinicId
   */
  async listarPorClinica(clinicId: string): Promise<Agendamento[]> {
    if (!clinicId || clinicId.trim() === '') {
      throw new Error('clinicId é obrigatório');
    }
    return this.agendamentoRepo.find({ where: { clinicId }, order: { startISO: 'ASC' } });
  }

  /**
   * Busca agendamento por id e clinicId
   */
  async buscarPorIdEClinica(id: string, clinicId: string): Promise<Agendamento | undefined> {
    if (!clinicId || clinicId.trim() === '') {
      throw new Error('clinicId é obrigatório');
    }
    return this.agendamentoRepo.findOne({ where: { id, clinicId } });
  }

  /**
   * Confirma agendamento por id e clinicId
   */
  async confirmarAgendamentoPorClinica(id: string, clinicId: string): Promise<void> {
    if (!clinicId || clinicId.trim() === '') {
      throw new Error('clinicId é obrigatório');
    }
    const agendamento = await this.agendamentoRepo.findOne({ where: { id, clinicId } });
    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado para clínica ${clinicId}`);
    }
    agendamento.status = 'confirmado';
    await this.agendamentoRepo.save(agendamento);
    this.logger.log(`✅ Agendamento confirmado: ${id} | Clínica: ${clinicId}`);
  }
}

