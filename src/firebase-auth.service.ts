import { Injectable, UnauthorizedException } from '@nestjs/common';
import admin from './firebaseAdmin';

@Injectable()
export class FirebaseAuthService {
  async verifyToken(idToken: string): Promise<any> {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return decoded;
    } catch (err: any) {
      throw new UnauthorizedException('Token Firebase inválido ou expirado');
    }
  }
}

