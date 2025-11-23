import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Indicacao } from './entities/indicacao.entity';
import { Recompensa } from './entities/recompensa.entity';

interface DadosIndicacao {
  nome: string;
  telefone: string;
  email?: string;
}

@Injectable()
export class IndicacoesService {
    async findAll(): Promise<Indicacao[]> {
      // Utiliza o mock do repositório para testes
      return await this.indicacaoRepo.find();
    }

    async create(dto: Partial<Indicacao>): Promise<Indicacao> {
      // Utiliza o mock do repositório para testes
      const entity = this.indicacaoRepo.create(dto);
      return await this.indicacaoRepo.save(entity);
    }
  private readonly logger = new Logger(IndicacoesService.name);

  constructor(
    @InjectRepository(Indicacao)
    private readonly indicacaoRepo: Repository<Indicacao>,
    @InjectRepository(Recompensa)
    private readonly recompensaRepo: Repository<Recompensa>,
  ) {}

  /**
   * Registrar nova indicação
   * Regras:
   * - 1 indicação = 1 ponto
   * - 3 pontos = 1 sessão grátis
   */
  async registrarIndicacao(
    indicadorId: string,
    dados: DadosIndicacao,
  ): Promise<{ indicacao: Indicacao; recompensa: Recompensa }> {
    // Criar indicação
    const indicacao = this.indicacaoRepo.create({
      indicadorId,
      nomeIndicado: dados.nome,
      telefoneIndicado: dados.telefone,
      emailIndicado: dados.email,
      status: 'pendente',
      pontosGanhos: 1,
    });

    await this.indicacaoRepo.save(indicacao);

    // Atualizar recompensa do indicador
    let recompensa = await this.recompensaRepo.findOne({
      where: { leadId: indicadorId },
    });

    if (!recompensa) {
      recompensa = this.recompensaRepo.create({
        leadId: indicadorId,
        pontosAcumulados: 0,
        sessoesGratisDisponiveis: 0,
        historicoIndicacoes: [],
      });
    }

    recompensa.pontosAcumulados += 1;
    recompensa.historicoIndicacoes = [...recompensa.historicoIndicacoes, indicacao.id];

    // A cada 3 pontos, ganhar 1 sessão grátis
    const novasSessoes = Math.floor(recompensa.pontosAcumulados / 3);
    const sessoesAnteriores = Math.floor((recompensa.pontosAcumulados - 1) / 3);
    
    if (novasSessoes > sessoesAnteriores) {
      recompensa.sessoesGratisDisponiveis += (novasSessoes - sessoesAnteriores);
      this.logger.log(
        `🎁 ${indicadorId} ganhou sessão grátis! Total: ${recompensa.sessoesGratisDisponiveis}`,
      );
    }

    await this.recompensaRepo.save(recompensa);

    this.logger.log(
      `✅ Indicação registrada: ${indicacao.id} | Indicador: ${indicadorId} | Pontos: ${recompensa.pontosAcumulados}`,
    );

    return { indicacao, recompensa };
  }

  /**
   * Marcar que indicado agendou
   * Bônus: +0 pontos (apenas tracking)
   */
  async indicadoAgendou(indicacaoId: string, agendamentoId: string): Promise<void> {
    const indicacao = await this.indicacaoRepo.findOne({
      where: { id: indicacaoId },
    });

    if (!indicacao) {
      throw new NotFoundException(`Indicação ${indicacaoId} não encontrada`);
    }

    indicacao.status = 'agendado';
    indicacao.agendamentoId = agendamentoId;

    await this.indicacaoRepo.save(indicacao);

    this.logger.log(`📅 Indicado agendou: ${indicacao.nomeIndicado}`);
  }

  /**
   * Marcar que indicado compareceu
   * Bônus: +2 pontos extras
   */
  async indicadoCompareceu(indicacaoId: string): Promise<void> {
    const indicacao = await this.indicacaoRepo.findOne({
      where: { id: indicacaoId },
    });

    if (!indicacao) {
      throw new NotFoundException(`Indicação ${indicacaoId} não encontrada`);
    }

    indicacao.status = 'compareceu';
    indicacao.pontosGanhos = 3; // 1 inicial + 2 bônus

    await this.indicacaoRepo.save(indicacao);

    // Bônus extra por comparecimento
    const recompensa = await this.recompensaRepo.findOne({
      where: { leadId: indicacao.indicadorId },
    });

    if (recompensa) {
      recompensa.pontosAcumulados += 2; // Bônus extra
      
      // Verificar se ganhou nova sessão
      const novasSessoes = Math.floor(recompensa.pontosAcumulados / 3);
      const sessoesAnteriores = Math.floor((recompensa.pontosAcumulados - 2) / 3);
      
      if (novasSessoes > sessoesAnteriores) {
        recompensa.sessoesGratisDisponiveis += (novasSessoes - sessoesAnteriores);
      }

      await this.recompensaRepo.save(recompensa);

      this.logger.log(
        `🎉 Bônus! Indicado compareceu: ${indicacao.nomeIndicado} | Indicador: ${indicacao.indicadorId} ganhou +2 pontos`,
      );
    }
  }

  /**
   * Resgatar sessão grátis
   */
  async resgatarSessao(leadId: string): Promise<{ sucesso: boolean; mensagem: string }> {
    const recompensa = await this.recompensaRepo.findOne({
      where: { leadId },
    });

    if (!recompensa || recompensa.sessoesGratisDisponiveis <= 0) {
      return { 
        sucesso: false, 
        mensagem: 'Você não tem sessões gratuitas disponíveis' 
      };
    }

    recompensa.sessoesGratisDisponiveis--;
    recompensa.ultimaResgate = new Date();
    await this.recompensaRepo.save(recompensa);

    this.logger.log(
      `🎁 Sessão grátis resgatada: ${leadId} (${recompensa.sessoesGratisDisponiveis} restantes)`,
    );

    return { 
      sucesso: true, 
      mensagem: 'Sessão grátis resgatada com sucesso!' 
    };
  }

  /**
   * Buscar indicações de um lead
   */
  async getIndicacoes(indicadorId: string): Promise<Indicacao[]> {
    return this.indicacaoRepo.find({
      where: { indicadorId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar recompensa (gamificação)
   */
  async getRecompensa(leadId: string): Promise<Recompensa> {
    let recompensa = await this.recompensaRepo.findOne({
      where: { leadId },
    });

    if (!recompensa) {
      recompensa = this.recompensaRepo.create({
        leadId,
        pontosAcumulados: 0,
        sessoesGratisDisponiveis: 0,
        historicoIndicacoes: [],
      });
      await this.recompensaRepo.save(recompensa);
    }

    return recompensa;
  }
}

