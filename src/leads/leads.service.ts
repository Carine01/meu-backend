import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, retryWhen, scan, mergeMap, tap, throwError, timer } from 'rxjs';
import { AxiosError } from 'axios';
import { IARA_CONFIG_TOKEN, IaraConfig } from '../leads/iara-config.interface'; // Caminho ajustado

// DTOs (Data Transfer Objects) para tipagem
interface LeadDto {
  nome: string;
  phone: string;
  clinicId?: string;
  origem?: string;
}

interface IaraResponse {
  ok: boolean;
  id?: number;
  error?: string;
  message?: string;
}

// Configurações de Retry
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(IARA_CONFIG_TOKEN) private readonly iaraConfig: IaraConfig,
  ) {
    if (!this.iaraConfig.edgeUrl || !this.iaraConfig.secret) {
        this.logger.error('IaraConfig não foi fornecido corretamente. Verifique o LeadsModule.');
    }
  }

  private exponentialBackoffRetry(maxRetries: number, delayMs: number) {
    return retryWhen<any>(errors =>
      errors.pipe(
        // acumula contagem e o último erro
        scan((acc, error: AxiosError) => ({ count: acc.count + 1, error }), { count: 0, error: null as AxiosError | null }),
        // para cada erro acumulado decide se reintenta (timer) ou falha de vez
        mergeMap(acc => {
          const error = acc.error as AxiosError;
          const isRecoverable = !error.response || (error.response.status >= 500 && error.response.status < 600);

          if (acc.count > maxRetries || !isRecoverable) {
            return throwError(() => error);
          }

          const delayTime = delayMs * Math.pow(2, acc.count - 1);
          this.logger.warn(`Tentativa ${acc.count}/${maxRetries} falhou. Tentando novamente em ${delayTime}ms...`);
          return timer(delayTime);
        }),
      )
    );
  }

  async enviarLeadParaSupabase(lead: LeadDto): Promise<IaraResponse> {
    const { edgeUrl, secret, defaultClinic, defaultOrigem } = this.iaraConfig;

    const payload = {
      ...lead,
      clinicId: lead.clinicId || defaultClinic,
      origem: lead.origem || defaultOrigem,
      timestamp: new Date().toISOString(),
    };

    // Remove propriedades vazias/nulas
    Object.keys(payload).forEach((k) => {
      const key = k as keyof typeof payload;
      if (payload[key] == null || payload[key] === '') {
        delete payload[key];
      }
    });

    try {
      const request$ = this.httpService.post<IaraResponse>(edgeUrl, payload, {
        headers: {
          'x-iara-secret': secret,
          'Content-Type': 'application/json',
          'User-Agent': 'NestJS-IARA/4.0-DIP-Retry',
        },
      }).pipe(
        this.exponentialBackoffRetry(MAX_RETRIES, RETRY_DELAY_MS),
        
        catchError((error: AxiosError<any>) => {
          if (error.response) {
            this.logger.error(`Falha final na requisição HTTP para IARA: Status ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            const errorMessage = error.response.data?.message || 'Erro de comunicação com serviço externo';
            throw new HttpException(errorMessage, error.response.status);
          } else {
            this.logger.error(`Falha final de rede/timeout ao conectar com IARA: ${error.message}`);
            throw new HttpException('Falha de rede persistente ao conectar com serviço externo', HttpStatus.SERVICE_UNAVAILABLE);
          }
        }),
        tap(response => {
            if (!response.data.ok) {
                this.logger.error(`Erro Supabase (Edge) na resposta final: ${response.data.error || response.data.message}`);
                throw new HttpException(response.data.error || response.data.message || 'Erro desconhecido na comunicação com Supabase/IARA', HttpStatus.BAD_GATEWAY);
            }
        })
      );

      const response = await firstValueFrom(request$);
      
      this.logger.log(`Lead enviado com sucesso para Supabase/IARA: ${JSON.stringify(response.data)}`);
      return { ok: true, id: response.data.id };

    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retorna origem do lead ou null se não existir
   * Evita erros de "Cannot read property 'origem' of undefined"
   */
  getOrigem(lead: any): string | null {
    if (!lead || typeof lead !== 'object') {
      return null;
    }
    return lead.origem || null;
  }

  /**
   * Valida se lead tem dados mínimos necessários
   * @param lead Lead para validar
   * @returns true se lead é válido
   */
  isValidLead(lead: any): boolean {
    return (
      lead &&
      typeof lead === 'object' &&
      typeof lead.nome === 'string' &&
      lead.nome.trim().length >= 3 &&
      typeof lead.phone === 'string' &&
      lead.phone.replace(/\D/g, '').length >= 10
    );
  }

  /**
   * Sanitiza dados do lead removendo espaços e aplicando valores padrão
   * @param lead Lead para sanitizar
   * @returns Lead sanitizado
   */
  sanitizeLead(lead: LeadDto): LeadDto {
    return {
      nome: lead.nome?.trim() || '',
      phone: lead.phone?.trim().replace(/\D/g, '') || '',
      clinicId: lead.clinicId?.trim() || this.iaraConfig.defaultClinic,
      origem: lead.origem?.trim() || this.iaraConfig.defaultOrigem,
    };
  }

  findAll() {
    this.logger.log('Buscando todos os leads (simulado)');
    return [];
  }

  create(leadDto: LeadDto) {
    this.logger.log(`Criando lead (simulado): ${leadDto.nome}`);
    return { id: 1, ...leadDto };
  }
}

