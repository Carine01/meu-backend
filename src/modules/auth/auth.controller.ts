import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Login de usuário
   * 
   * Autentica usando Firebase e retorna JWT para uso na API.
   * 
   * @param loginDto - Email e senha do usuário
   * @returns Token JWT e dados do usuário
   * @throws UnauthorizedException se credenciais inválidas
   * 
   * @example
   * POST /auth/login
   * {
   *   "email": "admin@elevare.com",
   *   "password": "senha123"
   * }
   * 
   * Response:
   * {
   *   "accessToken": "eyJhbGc...",
   *   "user": {
   *     "email": "admin@elevare.com",
   *     "clinicId": "elevare-01",
   *     "roles": ["admin"]
   *   }
   * }
   */
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Registrar novo usuário
   * 
   * Apenas admins podem criar novos usuários.
   * Requer autenticação e role 'admin'.
   * 
   * @param registerDto - Dados do novo usuário (email, senha, clinicId, roles)
   * @returns Confirmação com ID do usuário criado
   * @throws ForbiddenException se não for admin
   * 
   * @example
   * POST /auth/register
   * Authorization: Bearer <admin_token>
   * {
   *   "email": "novo@elevare.com",
   *   "password": "senha456",
   *   "clinicId": "elevare-02",
   *   "roles": ["user"]
   * }
   */
  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async register(@Body() registerDto: RegisterDto) {
    const usuario = await this.authService.register(registerDto);
    return {
      message: 'Usuário criado com sucesso',
      userId: usuario.id,
      email: usuario.email,
    };
  }

  /**
   * Obter dados do usuário autenticado
   * 
   * Retorna informações do usuário baseado no token JWT.
   * 
   * @param req - Request com dados do usuário (injetado pelo guard)
   * @returns Dados do usuário (userId, email, clinicId, roles)
   * @throws UnauthorizedException se token inválido
   * 
   * @example
   * GET /auth/me
   * Authorization: Bearer <token>
   * 
   * Response:
   * {
   *   "userId": "abc123",
   *   "email": "user@elevare.com",
   *   "clinicId": "elevare-01",
   *   "roles": ["user"]
   * }
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return {
      userId: req.user.userId,
      email: req.user.email,
      clinicId: req.user.clinicId,
      roles: req.user.roles,
    };
  }

  @Post('seed-admin')
  async seedAdmin() {
    await this.authService.seedAdminUser();
    return { message: 'Admin seed executado' };
  }
}

