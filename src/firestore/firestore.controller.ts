import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FirestoreService } from './firestore.service';
import { FirebaseAuthGuard } from '../firebase-auth.guard';

@Controller('firestore')
@UseGuards(FirebaseAuthGuard)
export class FirestoreController {
  constructor(private readonly fs: FirestoreService) {}

  @Post(':collection')
  async create(@Param('collection') collection: string, @Body() body: any) {
    return this.fs.create(collection, body);
  }

  @Get(':collection/:id')
  async get(@Param('collection') collection: string, @Param('id') id: string) {
    return this.fs.get(collection, id);
  }

  @Get(':collection')
  async list(@Param('collection') collection: string) {
    return this.fs.list(collection);
  }

  @Put(':collection/:id')
  async update(@Param('collection') collection: string, @Param('id') id: string, @Body() body: any) {
    return this.fs.update(collection, id, body);
  }

  @Delete(':collection/:id')
  async remove(@Param('collection') collection: string, @Param('id') id: string) {
    return this.fs.remove(collection, id);
  }
}

