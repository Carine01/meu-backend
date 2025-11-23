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

