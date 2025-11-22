import { Controller, Post, Body, HttpException, HttpStatus, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @UsePipes(SanitizationPipe)
  @ApiOperation({ 
    summary: 'Criar novo lead', 
    description: 'Cria um novo lead e envia para processamento no sistema IARA/Supabase' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Lead criado com sucesso',
    schema: {
      example: {
        success: true,
        data: { ok: true, id: 123 }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Serviço externo indisponível' 
  })
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
