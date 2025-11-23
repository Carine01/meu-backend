import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  username: string;
  clinicId?: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // login agora recebe clinicId e injeta no payload
  async login(user: any, clinicId?: string) {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    if (clinicId) payload.clinicId = clinicId;
    return { access_token: this.jwtService.sign(payload) };
  }

  // valida token e checa clinicId se necessário (exemplo simplificado)
  validateToken(token: string, expectedClinicId?: string): JwtPayload {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token);
      if (expectedClinicId && decoded.clinicId !== expectedClinicId) {
        throw new UnauthorizedException('clinicId mismatch');
      }
      return decoded;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
