import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { validateClinicId, applyClinicIdFilter } from '../../lib/tenant';

@Injectable()
export class AgendamentosService {
  private readonly logger = new Logger(AgendamentosService.name);

  constructor(
    @InjectRepository(Agendamento)
    private readonly agendamentoRepo: Repository<Agendamento>,
  ) {}

  /**
   * Listar agendamentos por clínica
   * @param clinicId - ID da clínica
   */
  async listarPorClinica(clinicId: string): Promise<Agendamento[]> {
    validateClinicId(clinicId);
    
    const qb = this.agendamentoRepo.createQueryBuilder('agendamento');
    applyClinicIdFilter(qb, clinicId);
    
    return qb.getMany();
  }

  /**
   * Buscar agendamento por ID e clínica
   * @param id - ID do agendamento
   * @param clinicId - ID da clínica
   */
  async buscarPorIdEClinica(id: string, clinicId: string): Promise<Agendamento> {
    validateClinicId(clinicId);
    
    const qb = this.agendamentoRepo.createQueryBuilder('agendamento');
    applyClinicIdFilter(qb, clinicId);
    qb.andWhere('agendamento.id = :id', { id });
    
    const agendamento = await qb.getOne();
    
    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado para clínica ${clinicId}`);
    }
    
    return agendamento;
  }

  /**
   * Confirmar agendamento com verificação de clínica
   * @param id - ID do agendamento
   * @param clinicId - ID da clínica
   */
  async confirmarAgendamentoPorClinica(id: string, clinicId: string): Promise<void> {
    validateClinicId(clinicId);
    
    const agendamento = await this.buscarPorIdEClinica(id, clinicId);
    
    const statusAnterior = agendamento.status;
    agendamento.status = 'confirmado';
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(`✅ Agendamento confirmado: ${id}`, {
      agendamentoId: id,
      statusAnterior,
      statusNovo: 'confirmado',
      paciente: agendamento.nomePaciente,
      clinicId,
    });
  }

  /**
   * Criar novo agendamento
   */
  async criarAgendamento(dados: Partial<Agendamento>): Promise<Agendamento> {
    this.logger.debug(`Criando agendamento`, { dados });
    
    const agendamento = this.agendamentoRepo.create(dados);
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(
      `✅ Agendamento criado: ${agendamento.id} | ${agendamento.nomePaciente} | ${agendamento.startISO}`,
      {
        agendamentoId: agendamento.id,
        paciente: agendamento.nomePaciente,
        data: agendamento.startISO,
        clinicId: agendamento.clinicId,
        status: agendamento.status,
      },
    );

    return agendamento;
  }

  /**
   * Confirmar agendamento
   */
  async confirmarAgendamento(id: string): Promise<void> {
    this.logger.debug(`Confirmando agendamento`, { agendamentoId: id });
    
    const agendamento = await this.agendamentoRepo.findOne({ where: { id } });

    if (!agendamento) {
      this.logger.warn(`Agendamento não encontrado para confirmação`, { agendamentoId: id });
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    const statusAnterior = agendamento.status;
    agendamento.status = 'confirmado';
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(`✅ Agendamento confirmado: ${id}`, {
      agendamentoId: id,
      statusAnterior,
      statusNovo: 'confirmado',
      paciente: agendamento.nomePaciente,
      clinicId: agendamento.clinicId,
    });
  }

  /**
   * Cancelar agendamento
   */
  async cancelarAgendamento(id: string, motivo?: string): Promise<void> {
    this.logger.debug(`Cancelando agendamento`, { agendamentoId: id, motivo });
    
    const agendamento = await this.agendamentoRepo.findOne({ where: { id } });

    if (!agendamento) {
      this.logger.warn(`Agendamento não encontrado para cancelamento`, { agendamentoId: id });
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    const statusAnterior = agendamento.status;
    agendamento.status = 'cancelado';
    if (motivo) {
      agendamento.observacoes = `Cancelado: ${motivo}`;
    }
    await this.agendamentoRepo.save(agendamento);

    this.logger.log(`❌ Agendamento cancelado: ${id} | Motivo: ${motivo}`, {
      agendamentoId: id,
      statusAnterior,
      motivo,
      paciente: agendamento.nomePaciente,
      data: agendamento.startISO,
      clinicId: agendamento.clinicId,
    });
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
}

