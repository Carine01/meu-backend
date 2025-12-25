import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { BaseRepository } from '../../shared/base/base.repository';
import { validateClinicId } from '../../shared/utils/validation.util';

@Injectable()
export class AgendamentosService extends BaseRepository<Agendamento> {
  protected readonly logger = new Logger(AgendamentosService.name);
  protected readonly entityName = 'Agendamento';

  constructor(
    @InjectRepository(Agendamento)
    protected readonly repository: Repository<Agendamento>,
  ) {
    super();
  }

  // Keep backward compatibility
  private get agendamentoRepo() {
    return this.repository;
  }

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
    const agendamento = await this.findByIdOrFail(id);

    agendamento.status = 'confirmado';
    await this.repository.save(agendamento);

    this.logger.log(`✅ Agendamento confirmado: ${id}`);
  }

  /**
   * Cancelar agendamento
   */
  async cancelarAgendamento(id: string, motivo?: string): Promise<void> {
    const agendamento = await this.findByIdOrFail(id);

    agendamento.status = 'cancelado';
    if (motivo) {
      agendamento.observacoes = `Cancelado: ${motivo}`;
    }
    await this.repository.save(agendamento);

    this.logger.log(`❌ Agendamento cancelado: ${id} | Motivo: ${motivo}`);
  }

  /**
   * Marcar comparecimento
   */
  async marcarComparecimento(id: string): Promise<void> {
    const agendamento = await this.findByIdOrFail(id);

    agendamento.status = 'compareceu';
    await this.repository.save(agendamento);

    this.logger.log(`✅ Comparecimento registrado: ${id}`);
  }

  /**
   * Marcar no-show (falta)
   */
  async marcarNoShow(id: string): Promise<void> {
    const agendamento = await this.findByIdOrFail(id);

    agendamento.status = 'no-show';
    await this.repository.save(agendamento);

    this.logger.log(`⚠️ No-show registrado: ${id}`);
  }

  /**
   * Reagendar
   */
  async reagendar(id: string, novoStartISO: string): Promise<void> {
    const agendamento = await this.findByIdOrFail(id);

    const antigoHorario = agendamento.startISO;
    agendamento.startISO = novoStartISO;
    agendamento.status = 'agendado';
    agendamento.observacoes = `Reagendado de ${antigoHorario} para ${novoStartISO}`;

    await this.repository.save(agendamento);

    this.logger.log(`🔄 Agendamento reagendado: ${id} | Novo horário: ${novoStartISO}`);
  }

  /**
   * Buscar agendamento por ID
   */
  async findById(id: string): Promise<Agendamento> {
    return await this.findByIdOrFail(id);
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
    validateClinicId(clinicId);
    return this.repository.find({ 
      where: { clinicId }, 
      order: { startISO: 'ASC' } 
    });
  }

  /**
   * Busca agendamento por id e clinicId
   */
  async buscarPorIdEClinica(id: string, clinicId: string): Promise<Agendamento | null> {
    validateClinicId(clinicId);
    return this.repository.findOne({ where: { id, clinicId } });
  }

  /**
   * Confirma agendamento por id e clinicId
   */
  async confirmarAgendamentoPorClinica(id: string, clinicId: string): Promise<void> {
    validateClinicId(clinicId);
    const agendamento = await this.findByIdAndClinicOrFail(id, clinicId);
    
    agendamento.status = 'confirmado';
    await this.repository.save(agendamento);
    this.logger.log(`✅ Agendamento confirmado: ${id} | Clínica: ${clinicId}`);
  }
}

