import { Controller, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';

interface CreateLeadDto {
  nome: string;
  phone: string;
  clinicId?: string;
  origem?: string;
}

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Criar novo lead e enviar para Supabase/IARA
   * 
   * Este endpoint recebe dados de formulários e:
   * 1. Valida os dados
   * 2. Envia para Supabase Edge Function (IARA)
   * 3. IARA processa e adiciona na fila de mensagens
   * 
   * 🔒 Protegido por JWT
   * 
   * @param createLeadDto - Dados do lead (nome, telefone, origem)
   * @returns Confirmação de criação
   * @throws HttpException se erro ao processar
   * 
   * @example
   * POST /leads
   * Authorization: Bearer <token>
   * {
   *   "nome": "Maria Silva",
   *   "phone": "+5511999999999",
   *   "clinicId": "elevare-01",
   *   "origem": "form_site"
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "leadId": "lead123",
   *     "status": "created"
   *   }
   * }
   */
  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    try {
      const result = await this.leadsService.enviarLeadParaSupabase(createLeadDto);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Erro ao criar lead',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

