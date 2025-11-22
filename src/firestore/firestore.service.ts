import { Injectable, Logger } from '@nestjs/common';
import admin from '../firebaseAdmin';

@Injectable()
export class FirestoreService {
  private readonly logger = new Logger(FirestoreService.name);
  private db = admin.firestore();

  async create(collection: string, data: any) {
    const clinicId = data.clinicId || 'default';
    this.logger.log(`[clinicId: ${clinicId}] Criando documento em ${collection}`);
    const ref = await this.db.collection(collection).add({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return { id: ref.id };
  }

  async get(collection: string, id: string, clinicId?: string) {
    if (clinicId) {
      this.logger.log(`[clinicId: ${clinicId}] Buscando documento ${id} em ${collection}`);
    }
    const doc = await this.db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    
    // Verificar clinicId se fornecido
    const docData = doc.data();
    if (clinicId && docData?.clinicId && docData.clinicId !== clinicId) {
      this.logger.warn(`[clinicId: ${clinicId}] Acesso negado a documento de outra clínica`);
      return null;
    }
    
    return { id: doc.id, ...docData };
  }

  async list(collection: string, limit = 50, clinicId?: string) {
    let query: any = this.db.collection(collection);
    
    if (clinicId) {
      this.logger.log(`[clinicId: ${clinicId}] Listando documentos filtrados em ${collection}`);
      query = query.where('clinicId', '==', clinicId);
    }
    
    const snapshot = await query.limit(limit).get();
    return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  }

  /**
   * Lista documentos filtrados por clinicId
   */
  async listByClinicId(collection: string, clinicId: string, limit = 50) {
    this.logger.log(`[clinicId: ${clinicId}] Filtrando documentos em ${collection}`);
    return this.list(collection, limit, clinicId);
  }

  async update(collection: string, id: string, data: any, clinicId?: string) {
    if (clinicId) {
      this.logger.log(`[clinicId: ${clinicId}] Atualizando documento ${id} em ${collection}`);
      // Verificar se o documento pertence à clínica antes de atualizar
      const existing = await this.get(collection, id, clinicId);
      if (!existing) {
        throw new Error(`Documento não encontrado ou acesso negado para clinicId: ${clinicId}`);
      }
    }
    
    await this.db.collection(collection).doc(id).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { id };
  }

  async remove(collection: string, id: string, clinicId?: string) {
    if (clinicId) {
      this.logger.log(`[clinicId: ${clinicId}] Removendo documento ${id} em ${collection}`);
      // Verificar se o documento pertence à clínica antes de remover
      const existing = await this.get(collection, id, clinicId);
      if (!existing) {
        throw new Error(`Documento não encontrado ou acesso negado para clinicId: ${clinicId}`);
      }
    }
    
    await this.db.collection(collection).doc(id).delete();
    return { id };
  }
}
