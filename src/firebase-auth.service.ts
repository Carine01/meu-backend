import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import admin from './firebaseAdmin';

@Injectable()
export class FirebaseAuthService {
  private readonly logger = new Logger(FirebaseAuthService.name);

  async verifyToken(idToken: string): Promise<any> {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      
      // Log clinicId se disponível nos custom claims
      if (decoded.clinicId) {
        this.logger.log(`[clinicId: ${decoded.clinicId}] Token verificado para usuário: ${decoded.uid}`);
      }
      
      return decoded;
    } catch (err) {
      throw new UnauthorizedException('Token Firebase inválido ou expirado');
    }
  }

  /**
   * Extrai clinicId dos custom claims do token
   */
  async extractClinicId(idToken: string): Promise<string | null> {
    try {
      const decoded = await this.verifyToken(idToken);
      return decoded.clinicId || null;
    } catch (err) {
      return null;
    }
  }
}
