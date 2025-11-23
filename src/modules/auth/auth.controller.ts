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

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

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

