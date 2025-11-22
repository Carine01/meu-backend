import { Injectable, Logger } from '@nestjs/common';
import admin from '../firebaseAdmin';

@Injectable()
export class FirestoreService {
  private readonly logger = new Logger(FirestoreService.name);
  private db = admin.firestore();

  async create(collection: string, data: any) {
    const ref = await this.db.collection(collection).add({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return { id: ref.id };
  }

  async get(collection: string, id: string) {
    const doc = await this.db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async list(collection: string, limit = 50) {
    const snapshot = await this.db.collection(collection).limit(limit).get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async update(collection: string, id: string, data: any) {
    await this.db.collection(collection).doc(id).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { id };
  }

  async remove(collection: string, id: string) {
    await this.db.collection(collection).doc(id).delete();
    return { id };
  }
}

