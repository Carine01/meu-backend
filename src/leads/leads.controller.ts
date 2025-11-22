import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo lead',
    description: 'Cria um novo lead e envia para o sistema IARA/Supabase' 
  })
  @ApiBody({ type: CreateLeadDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Lead criado com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          ok: true,
          id: 123
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['nome é obrigatório', 'telefone é obrigatório'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro interno do servidor' 
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
