import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProfileService, PerfilData } from './profile.service';
import { FirebaseAuthGuard } from '../firebase-auth.guard';

/**
 * Controller para gerenciar perfis de clínicas
 * Rotas protegidas por Firebase Auth
 */
@Controller('profile')
@UseGuards(FirebaseAuthGuard) // Protege todas as rotas com autenticação
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /profile/:clinicId
   * Busca perfil por ID
   */
  @Get(':clinicId')
  async getPerfil(@Param('clinicId') clinicId: string) {
    return this.profileService.getPerfilData(clinicId);
  }

  /**
   * POST /profile
   * Cria ou atualiza perfil
   * Body: PerfilData com clinicId obrigatório
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async savePerfil(@Body() data: PerfilData) {
    return this.profileService.savePerfilData(data);
  }

  /**
   * DELETE /profile/:clinicId/soft
   * Inativa perfil (soft delete)
   */
  @Delete(':clinicId/soft')
  @HttpCode(HttpStatus.OK)
  async limparPerfil(@Param('clinicId') clinicId: string) {
    return this.profileService.limparPerfilData(clinicId);
  }

  /**
   * DELETE /profile/:clinicId
   * Deleta perfil permanentemente
   */
  @Delete(':clinicId')
  @HttpCode(HttpStatus.OK)
  async deletarPerfil(@Param('clinicId') clinicId: string) {
    return this.profileService.deletarPerfilData(clinicId);
  }

  /**
   * GET /profile/:clinicId/export
   * Exporta perfil em formato estruturado
   */
  @Get(':clinicId/export')
  async exportarPerfil(@Param('clinicId') clinicId: string) {
    return this.profileService.exportarPerfilData(clinicId);
  }

  /**
   * GET /profile
   * Lista todos os perfis ativos (paginado)
   * Query params: limit (default 20), startAfter (para paginação)
   */
  @Get()
  async listarPerfis(
    @Query('limit') limit?: string,
    @Query('startAfter') startAfter?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.profileService.listarPerfis(limitNumber, startAfter);
  }
}

