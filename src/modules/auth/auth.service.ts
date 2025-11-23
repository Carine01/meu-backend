import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    async validateUser(email: string, password: string): Promise<any> {
      // Mock para teste
      return { email, id: 'mock-id' };
    }

    async validateToken(token: string): Promise<boolean> {
      // Mock para teste
      return true;
    }
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
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

    return {
      access_token: this.jwtService.sign(payload),
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

