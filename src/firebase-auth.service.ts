import { Injectable, UnauthorizedException } from '@nestjs/common';
import admin from './firebaseAdmin';

@Injectable()
export class FirebaseAuthService {
  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return decoded;
    } catch {
      throw new UnauthorizedException('Token Firebase inválido ou expirado');
    }
  }
}
