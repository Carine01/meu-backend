import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import admin from 'firebase-admin';
import { FilaEnvio } from '../mensagens/entities/mensagem.entity';
import { MensagemResolverService } from '../mensagens/mensagem-resolver.service';

/**
 * Service de Fila de Envio WhatsApp
 * 
 * Funcionalidades:
 * - Adicionar mensagens na fila com agendamento
 * - Processar fila em batches (10 por vez)
 * - Retry automático (3 tentativas com backoff)
 * - Integração com webhook Make.com/Zapier
 * - Status tracking: pending → sent/failed
 * 
 * Baseado na lógica original do Google Apps Script evento "fila_add"
 */
@Injectable()
export class FilaService {
  private readonly logger = new Logger(FilaService.name);
  private readonly firestore: admin.firestore.Firestore;
  private readonly COLLECTION_NAME = 'fila_envio';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 2000; // 2 segundos entre tentativas

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly mensagemResolver: MensagemResolverService,
  ) {
    this.firestore = admin.firestore();
  }

  /**
   * Adiciona nova mensagem à fila de envio
   * 
   * @param leadId - ID do lead destinatário
   * @param leadNome - Nome do destinatário
   * @param leadTelefone - Telefone E.164 (+5511999999999)
   * @param mensagemKey - Chave da mensagem da biblioteca (ex: BOASVINDAS_01)
   * @param variaveisExtras - Variáveis adicionais para interpolar
   * @param scheduledFor - Data/hora para envio agendado (opcional, padrão: agora)
   * @param clinicId - ID da clínica (opcional, padrão: elevare-01)
   * 
   * @example
   * ```typescript
   * await filaService.adicionarNaFila(
   *   'L123',
   *   'Maria Silva',
   *   '+5511999999999',
   *   'BOASVINDAS_01',
   *   { objetivo: 'criomodelagem' },
   *   new Date(Date.now() + 3600000) // Enviar em 1h
   * );
   * ```
   */
  async adicionarNaFila(
    leadId: string,
    leadNome: string,
    leadTelefone: string,
    mensagemKey: string,
    variaveisExtras: Record<string, string | number> = {},
    scheduledFor?: Date,
    clinicId: string = 'elevare-01',
  ): Promise<FilaEnvio> {
    // Validação de telefone E.164
    if (!leadTelefone.match(/^\+55\d{10,11}$/)) {
      throw new HttpException(
        `Telefone inválido: ${leadTelefone}. Deve estar no formato E.164: +5511999999999`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Resolver mensagem com variáveis
    const variaveis = {
      nome: leadNome,
      ...variaveisExtras,
    };

    const { template, mensagemResolvida } = this.mensagemResolver.resolverPorKey(
      mensagemKey,
      variaveis,
    );

    if (!template) {
      throw new HttpException(
        `Mensagem ${mensagemKey} não encontrada na biblioteca`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!template.ativo) {
      this.logger.warn(
        `Adicionando mensagem inativa à fila: ${mensagemKey} para ${leadNome}`,
      );
    }

    // Criar item da fila
    const agora = new Date();
    const tsCriado = agora.getTime() / 86400000; // Serial date (igual ao Google Sheets)

    const itemFila: FilaEnvio = {
      id: `FILA_${Date.now()}_${leadTelefone.replace(/\D/g, '')}`,
      tsCriado,
      destinoNome: leadNome,
      destinoTelefone: leadTelefone,
      msgId: mensagemKey,
      textoResolvido: mensagemResolvida,
      status: 'pending',
      clinicId,
      attempts: 0,
      scheduledFor: scheduledFor || agora,
      createdAt: agora,
      updatedAt: agora,
    };

    // Salvar no Firestore
    try {
      const docRef = this.firestore.collection(this.COLLECTION_NAME).doc(itemFila.id);
      await docRef.set(itemFila);

      this.logger.log(
        `Mensagem adicionada à fila: ${mensagemKey} para ${leadNome} (${leadTelefone})`,
        {
          filaId: itemFila.id,
          mensagemKey,
          destinatario: leadNome,
          telefone: leadTelefone,
          clinicId,
          scheduledFor: itemFila.scheduledFor?.toISOString() || new Date().toISOString(),
          status: itemFila.status,
        },
      );

      return itemFila;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao adicionar na fila: ${err.message}`, err.stack);
      throw new HttpException(
        'Erro ao adicionar mensagem na fila',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Processa fila de envio em batch
   * 
   * Busca até `batchSize` itens com status 'pending' e scheduledFor <= agora
   * Tenta enviar cada um, atualiza status para 'sent' ou 'failed'
   * Retry automático: até 3 tentativas com delay de 2s entre elas
   * 
   * @param batchSize - Quantidade de mensagens a processar (padrão: 10)
   * @returns Quantidade de mensagens enviadas com sucesso
   * 
   * @example
   * ```typescript
   * // Executar em CronJob a cada 1 minuto
   * @Cron('0 * * * * *') // A cada minuto
   * async handleCron() {
   *   await this.filaService.processarFila(10);
   * }
   * ```
   */
  async processarFila(batchSize: number = 10): Promise<number> {
    const agora = new Date();
    let enviados = 0;

    try {
      // Buscar itens pending com scheduledFor <= agora
      const snapshot = await this.firestore
        .collection(this.COLLECTION_NAME)
        .where('status', '==', 'pending')
        .where('scheduledFor', '<=', agora)
        .orderBy('scheduledFor', 'asc')
        .limit(batchSize)
        .get();

      if (snapshot.empty) {
        this.logger.debug('Fila de envio vazia');
        return 0;
      }

      this.logger.log(`Processando ${snapshot.size} mensagens da fila`);

      // Processar cada item
      for (const doc of snapshot.docs) {
        const item = doc.data() as FilaEnvio;

        try {
          // Tentar enviar via WhatsApp
          await this.enviarWhatsApp(item);

          // Sucesso: atualizar status
          await doc.ref.update({
            status: 'sent',
            attempts: admin.firestore.FieldValue.increment(1),
            updatedAt: new Date(),
          });

          enviados++;
          this.logger.log(`✅ Enviado: ${item.msgId} para ${item.destinoNome}`);
        } catch (error: any) {
          const err = error as Error;
          const novaTentativa = item.attempts + 1;

          // Retry ou falha definitiva?
          if (novaTentativa >= this.MAX_RETRIES) {
            // Falha definitiva
            await doc.ref.update({
              status: 'failed',
              attempts: novaTentativa,
              lastError: err.message,
              updatedAt: new Date(),
            });

            this.logger.error(
              `❌ FALHA DEFINITIVA (${novaTentativa}/${this.MAX_RETRIES}): ${item.msgId} para ${item.destinoNome} - ${err.message}`,
              {
                filaId: item.id,
                mensagemKey: item.msgId,
                destinatario: item.destinoNome,
                telefone: item.destinoTelefone,
                clinicId: item.clinicId,
                tentativas: novaTentativa,
                erro: err.message,
              },
            );
          } else {
            // Retry: mantém pending, incrementa attempts
            await doc.ref.update({
              attempts: novaTentativa,
              lastError: err.message,
              updatedAt: new Date(),
              // Reagenda para daqui alguns segundos (backoff)
              scheduledFor: new Date(Date.now() + this.RETRY_DELAY_MS * novaTentativa),
            });

            this.logger.warn(
              `⚠️ Retry ${novaTentativa}/${this.MAX_RETRIES}: ${item.msgId} para ${item.destinoNome} - ${err.message}`,
            );
          }
        }
      }

      this.logger.log(`Processamento concluído: ${enviados}/${snapshot.size} enviados`);
      return enviados;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao processar fila: ${err.message}`, err.stack);
      return enviados;
    }
  }

  /**
   * Envia mensagem via webhook WhatsApp (Make.com/Zapier/n8n)
   * 
   * Integração com sistema de webhooks criado anteriormente
   * Usa WEBHOOK_MAKE_URL ou WEBHOOK_URL como fallback
   * 
   * @param item - Item da fila a enviar
   * @private
   */
  private async enviarWhatsApp(item: FilaEnvio): Promise<void> {
    const webhookUrl =
      this.configService.get<string>('MAKE_WEBHOOK_URL') ||
      this.configService.get<string>('WEBHOOK_URL');

    if (!webhookUrl) {
      throw new Error(
        'WEBHOOK_URL não configurado. Defina MAKE_WEBHOOK_URL ou WEBHOOK_URL no .env',
      );
    }

    const payload = {
      phone: item.destinoTelefone,
      message: item.textoResolvido,
      messageId: item.msgId,
      leadName: item.destinoNome,
      clinicId: item.clinicId,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(webhookUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            // Adicionar token se configurado
            ...(this.configService.get<string>('WEBHOOK_TOKEN') && {
              Authorization: `Bearer ${this.configService.get<string>('WEBHOOK_TOKEN')}`,
            }),
          },
          timeout: 10000, // 10 segundos
        }),
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Webhook retornou status ${response.status}`);
      }

      this.logger.debug(`Webhook respondeu: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      const err = error as any;

      if (err.response) {
        // Erro HTTP (4xx, 5xx)
        throw new Error(
          `Webhook falhou: ${err.response.status} - ${JSON.stringify(err.response.data)}`,
        );
      } else if (err.code === 'ECONNABORTED') {
        // Timeout
        throw new Error('Timeout ao enviar para webhook (10s)');
      } else {
        // Erro de rede
        throw new Error(`Erro de rede: ${err.message}`);
      }
    }
  }

  /**
   * Cancela mensagem pendente na fila
   * 
   * @param filaId - ID do item da fila
   * @returns true se cancelado, false se não encontrado
   */
  async cancelarMensagem(filaId: string): Promise<boolean> {
    try {
      const docRef = this.firestore.collection(this.COLLECTION_NAME).doc(filaId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return false;
      }

      const item = doc.data() as FilaEnvio;

      if (item.status !== 'pending') {
        throw new HttpException(
          `Não é possível cancelar mensagem com status "${item.status}"`,
          HttpStatus.BAD_REQUEST,
        );
      }

      await docRef.update({
        status: 'cancelled',
        updatedAt: new Date(),
      });

      this.logger.log(`Mensagem cancelada: ${filaId}`);
      return true;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao cancelar mensagem: ${err.message}`, err.stack);
      throw new HttpException(
        'Erro ao cancelar mensagem',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca itens da fila por status
   * 
   * @param status - Status a filtrar (pending, sent, failed, cancelled)
   * @param clinicId - ID da clínica (opcional)
   * @param limit - Quantidade máxima de resultados (padrão: 50)
   * @returns Array de itens da fila
   */
  async listarPorStatus(
    status: FilaEnvio['status'],
    clinicId?: string,
    limit: number = 50,
  ): Promise<FilaEnvio[]> {
    try {
      let query = this.firestore
        .collection(this.COLLECTION_NAME)
        .where('status', '==', status);
      
      // Apply clinicId filter if provided
      if (clinicId) {
        query = query.where('clinicId', '==', clinicId);
      }
      
      const snapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => doc.data() as FilaEnvio);
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao listar fila: ${err.message}`, err.stack);
      throw new HttpException(
        'Erro ao listar fila de envio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Estatísticas da fila de envio
   * 
   * @param clinicId - ID da clínica (opcional)
   * @returns Contadores por status
   */
  async getEstatisticas(clinicId?: string): Promise<Record<FilaEnvio['status'], number>> {
    try {
      let query = this.firestore.collection(this.COLLECTION_NAME);
      
      // Apply clinicId filter if provided
      if (clinicId) {
        query = query.where('clinicId', '==', clinicId) as any;
      }
      
      const snapshot = await query.get();

      const stats: Record<FilaEnvio['status'], number> = {
        pending: 0,
        sent: 0,
        failed: 0,
        cancelled: 0,
      };

      snapshot.docs.forEach(doc => {
        const item = doc.data() as FilaEnvio;
        stats[item.status] = (stats[item.status] || 0) + 1;
      });

      return stats;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao buscar estatísticas: ${err.message}`, err.stack);
      throw new HttpException(
        'Erro ao buscar estatísticas da fila',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Remove mensagens antigas da fila (para limpeza periódica)
   * 
   * @param dataLimite - Remove mensagens enviadas antes desta data
   * @returns Número de mensagens removidas
   * 
   * @example
   * ```typescript
   * const dataLimite = new Date();
   * dataLimite.setDate(dataLimite.getDate() - 90); // 90 dias atrás
   * await filaService.limparMensagensAntigas(dataLimite);
   * ```
   */
  async limparMensagensAntigas(dataLimite: Date): Promise<{ deletedCount: number }> {
    try {
      this.logger.log('🧹 Limpando mensagens antigas...', {
        dataLimite: dataLimite.toISOString()
      });

      const snapshot = await this.firestore
        .collection(this.COLLECTION_NAME)
        .where('status', '==', 'sent')
        .where('sentAt', '<', admin.firestore.Timestamp.fromDate(dataLimite))
        .get();

      if (snapshot.empty) {
        this.logger.debug('Nenhuma mensagem antiga para limpar');
        return { deletedCount: 0 };
      }

      // Deletar em batch (máximo 500 por batch no Firestore)
      const batchSize = 500;
      let deletedCount = 0;

      for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = this.firestore.batch();
        const batchDocs = snapshot.docs.slice(i, i + batchSize);

        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        deletedCount += batchDocs.length;

        this.logger.debug(`Batch deletado: ${batchDocs.length} documentos`);
      }

      this.logger.log('✅ Mensagens antigas removidas', {
        deletedCount,
        dataLimite: dataLimite.toISOString()
      });

      return { deletedCount };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao limpar mensagens antigas: ${err.message}`, err.stack);
      throw new HttpException(
        'Erro ao limpar mensagens antigas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
