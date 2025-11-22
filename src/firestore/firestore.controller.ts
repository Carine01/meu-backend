import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FirestoreService } from './firestore.service';
import { FirebaseAuthGuard } from '../firebase-auth.guard';

@ApiTags('firestore')
@ApiBearerAuth()
@Controller('firestore')
@UseGuards(FirebaseAuthGuard)
export class FirestoreController {
  constructor(private readonly fs: FirestoreService) {}

  @Post(':collection')
  @ApiOperation({ 
    summary: 'Criar documento',
    description: 'Cria um novo documento na coleção especificada do Firestore'
  })
  @ApiParam({ name: 'collection', description: 'Nome da coleção', example: 'users' })
  @ApiBody({ 
    schema: { 
      example: { name: 'João', email: 'joao@example.com' } 
    } 
  })
  @ApiResponse({ status: 201, description: 'Documento criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Param('collection') collection: string, @Body() body: any) {
    return this.fs.create(collection, body);
  }

  @Get(':collection/:id')
  @ApiOperation({ 
    summary: 'Obter documento',
    description: 'Obtém um documento específico pelo ID'
  })
  @ApiParam({ name: 'collection', description: 'Nome da coleção', example: 'users' })
  @ApiParam({ name: 'id', description: 'ID do documento', example: 'doc123' })
  @ApiResponse({ status: 200, description: 'Documento encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  async get(@Param('collection') collection: string, @Param('id') id: string) {
    return this.fs.get(collection, id);
  }

  @Get(':collection')
  @ApiOperation({ 
    summary: 'Listar documentos',
    description: 'Lista todos os documentos de uma coleção'
  })
  @ApiParam({ name: 'collection', description: 'Nome da coleção', example: 'users' })
  @ApiResponse({ status: 200, description: 'Lista de documentos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async list(@Param('collection') collection: string) {
    return this.fs.list(collection);
  }

  @Put(':collection/:id')
  @ApiOperation({ 
    summary: 'Atualizar documento',
    description: 'Atualiza um documento existente'
  })
  @ApiParam({ name: 'collection', description: 'Nome da coleção', example: 'users' })
  @ApiParam({ name: 'id', description: 'ID do documento', example: 'doc123' })
  @ApiBody({ 
    schema: { 
      example: { name: 'João Silva' } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Documento atualizado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  async update(@Param('collection') collection: string, @Param('id') id: string, @Body() body: any) {
    return this.fs.update(collection, id, body);
  }

  @Delete(':collection/:id')
  @ApiOperation({ 
    summary: 'Remover documento',
    description: 'Remove um documento do Firestore'
  })
  @ApiParam({ name: 'collection', description: 'Nome da coleção', example: 'users' })
  @ApiParam({ name: 'id', description: 'ID do documento', example: 'doc123' })
  @ApiResponse({ status: 200, description: 'Documento removido' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  async remove(@Param('collection') collection: string, @Param('id') id: string) {
    return this.fs.remove(collection, id);
  }
}
