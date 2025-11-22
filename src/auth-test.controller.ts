import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth-test')
export class AuthTestController {
  @Get()
  @UseGuards(FirebaseAuthGuard)
  getProfile(@Req() req: any) {
    // Retorna os dados do usuário autenticado pelo Firebase
    return { firebaseUser: req.user };
  }
}

