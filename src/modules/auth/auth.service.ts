import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private getRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not configured. Please set it in your environment variables.');
    }
    return secret;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; refresh_token: string; user: any }> {
    const usuario = await this.usuarioRepo.findOne({ 
      where: { email: loginDto.email, ativo: true } 
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { 
      sub: usuario.id, 
      email: usuario.email,
      clinicId: usuario.clinicId,
      roles: usuario.roles,
    };

    this.logger.log(`✅ Login: ${usuario.email} (Clinic: ${usuario.clinicId})`);

    const refreshSecret = this.getRefreshSecret();

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d', secret: refreshSecret }),
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        clinicId: usuario.clinicId,
        roles: usuario.roles,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<Usuario> {
    const existe = await this.usuarioRepo.findOne({ 
      where: { email: registerDto.email } 
    });

    if (existe) {
      throw new ConflictException('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(registerDto.senha, 10);

    const usuario = this.usuarioRepo.create({
      email: registerDto.email,
      senha: senhaHash,
      nome: registerDto.nome,
      clinicId: registerDto.clinicId,
      roles: ['user'],
    });

    await this.usuarioRepo.save(usuario);

    this.logger.log(`🆕 Usuário criado: ${usuario.email}`);
    return usuario;
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      const refreshSecret = this.getRefreshSecret();
      const payload = this.jwtService.verify(token, { secret: refreshSecret });
      
      // Optionally check if token is revoked/blacklisted here
      // For now, we just verify the user still exists and is active
      const usuario = await this.usuarioRepo.findOne({ 
        where: { id: payload.sub, ativo: true } 
      });

      if (!usuario) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        clinicId: payload.clinicId,
        roles: payload.roles,
      };

      this.logger.log(`🔄 Token renovado: ${payload.email}`);

      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`❌ Refresh token inválido: ${errorMessage}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async seedAdminUser(): Promise<void> {
    const adminEmail = 'admin@elevare.com';
    const existe = await this.usuarioRepo.findOne({ where: { email: adminEmail } });

    if (!existe) {
      const senhaHash = await bcrypt.hash('admin123', 10);
      const admin = this.usuarioRepo.create({
        email: adminEmail,
        senha: senhaHash,
        nome: 'Administrador',
        clinicId: 'ELEVARE_MAIN',
        roles: ['admin', 'user'],
      });
      await this.usuarioRepo.save(admin);
      this.logger.warn(`🔐 Admin seed criado: ${adminEmail} / admin123`);
    }
  }
}

