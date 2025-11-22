import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

/**
 * Interface para dados de perfil da clínica/profissional
 */
export interface PerfilData {
  clinicId: string;
  clinica_nome?: string;
  profissional_nome?: string;
  profissional_cpf?: string;
  profissional_telefone?: string;
  profissional_email?: string;
  especialidade?: string;
  endereco?: {
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  configuracoes?: {
    horario_atendimento?: string;
    tempo_consulta_minutos?: number;
    aceita_agendamento_online?: boolean;
    whatsapp_business?: string;
  };
  metadata?: {
    criado_em?: string;
    atualizado_em?: string;
    versao?: string;
  };
}

/**
 * Serviço para gerenciar perfis de clínicas/profissionais no Firestore
 * Segue princípios SOLID e boas práticas NestJS
 */
@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  private readonly db: admin.firestore.Firestore;
  private readonly collection = 'profiles';

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Busca perfil por clinic ID
   * @param clinicId ID único da clínica
   * @returns Dados do perfil ou null se não encontrado
   */
  async getPerfilData(clinicId: string): Promise<PerfilData | null> {
    if (!clinicId || clinicId.trim() === '') {
      throw new HttpException('clinicId é obrigatório', HttpStatus.BAD_REQUEST);
    }

    try {
      this.logger.log(`Buscando perfil para clinicId: ${clinicId}`);
      
      const docRef = this.db.collection(this.collection).doc(clinicId);
      const doc = await docRef.get();

      if (!doc.exists) {
        this.logger.warn(`Perfil não encontrado: ${clinicId}`);
        return null;
      }

      const data = doc.data() as PerfilData;
      this.logger.log(`Perfil encontrado: ${clinicId}`);
      return data;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao buscar perfil ${clinicId}: ${err.message}`);
      throw new HttpException(
        'Erro ao buscar perfil',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Salva ou atualiza perfil no Firestore
   * @param data Dados do perfil (clinicId obrigatório)
   * @returns Resposta de sucesso com timestamp
   */
  async savePerfilData(
    data: PerfilData,
  ): Promise<{ status: string; message: string; timestamp: string }> {
    // Validação de dados
    if (!data || typeof data !== 'object') {
      throw new HttpException(
        'Dados inválidos: deve ser um objeto',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.clinicId || data.clinicId.trim() === '') {
      throw new HttpException('clinicId é obrigatório', HttpStatus.BAD_REQUEST);
    }

    // Validação de tamanho (Firestore tem limite de 1MB por documento)
    const dataString = JSON.stringify(data);
    if (dataString.length > 1000000) {
      throw new HttpException(
        `Dados muito grandes: ${dataString.length} bytes (máximo 1MB)`,
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    try {
      const clinicId = data.clinicId;
      const timestamp = new Date().toISOString();

      // Adiciona metadata de versionamento
      const perfilComMetadata: PerfilData = {
        ...data,
        metadata: {
          ...data.metadata,
          atualizado_em: timestamp,
          versao: '1.0',
          criado_em: data.metadata?.criado_em || timestamp,
        },
      };

      const docRef = this.db.collection(this.collection).doc(clinicId);
      await docRef.set(perfilComMetadata, { merge: true });

      this.logger.log(`Perfil salvo com sucesso: ${clinicId}`);
      return {
        status: 'success',
        message: 'Perfil salvo com sucesso!',
        timestamp,
      };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao salvar perfil: ${err.message}`);
      throw new HttpException(
        'Erro ao salvar perfil',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Limpa dados de perfil (soft delete - marca como inativo)
   * @param clinicId ID da clínica
   * @returns Resposta de sucesso
   */
  async limparPerfilData(
    clinicId: string,
  ): Promise<{ status: string; message: string }> {
    if (!clinicId || clinicId.trim() === '') {
      throw new HttpException('clinicId é obrigatório', HttpStatus.BAD_REQUEST);
    }

    try {
      const docRef = this.db.collection(this.collection).doc(clinicId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new HttpException('Perfil não encontrado', HttpStatus.NOT_FOUND);
      }

      // Soft delete: mantém registro mas marca como inativo
      await docRef.update({
        ativo: false,
        'metadata.deletado_em': new Date().toISOString(),
      });

      this.logger.log(`Perfil limpo (inativado): ${clinicId}`);
      return { status: 'success', message: 'Perfil limpo com sucesso!' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      
      const err = error as Error;
      this.logger.error(`Erro ao limpar perfil: ${err.message}`);
      throw new HttpException(
        'Erro ao limpar perfil',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deleta perfil permanentemente do Firestore
   * @param clinicId ID da clínica
   * @returns Resposta de sucesso
   */
  async deletarPerfilData(
    clinicId: string,
  ): Promise<{ status: string; message: string }> {
    if (!clinicId || clinicId.trim() === '') {
      throw new HttpException('clinicId é obrigatório', HttpStatus.BAD_REQUEST);
    }

    try {
      const docRef = this.db.collection(this.collection).doc(clinicId);
      await docRef.delete();

      this.logger.log(`Perfil deletado permanentemente: ${clinicId}`);
      return { status: 'success', message: 'Perfil deletado com sucesso!' };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao deletar perfil: ${err.message}`);
      throw new HttpException(
        'Erro ao deletar perfil',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Exporta perfil em formato estruturado para backup/análise
   * @param clinicId ID da clínica
   * @returns Dados exportados com metadata
   */
  async exportarPerfilData(clinicId: string) {
    if (!clinicId || clinicId.trim() === '') {
      throw new HttpException('clinicId é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const perfil = await this.getPerfilData(clinicId);

    if (!perfil) {
      throw new HttpException('Perfil não encontrado', HttpStatus.NOT_FOUND);
    }

    return {
      exportado_em: new Date().toISOString(),
      versao: '1.0',
      format: 'elevare-profile-export',
      dados: perfil,
    };
  }

  /**
   * Lista todos os perfis ativos (paginado)
   * @param limit Quantidade de resultados
   * @param startAfter ID do último perfil (para paginação)
   * @returns Array de perfis
   */
  async listarPerfis(
    limit: number = 20,
    startAfter?: string,
  ): Promise<PerfilData[]> {
    try {
      let query = this.db
        .collection(this.collection)
        .where('ativo', '!=', false)
        .limit(limit);

      if (startAfter) {
        const startDoc = await this.db
          .collection(this.collection)
          .doc(startAfter)
          .get();
        query = query.startAfter(startDoc);
      }

      const snapshot = await query.get();
      const perfis: PerfilData[] = [];

      snapshot.forEach((doc) => {
        perfis.push(doc.data() as PerfilData);
      });

      this.logger.log(`Listados ${perfis.length} perfis`);
      return perfis;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao listar perfis: ${err.message}`);
      throw new HttpException(
        'Erro ao listar perfis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

