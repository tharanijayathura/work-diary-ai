import { Body, Controller, Post, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupRequest) {
    return this.authService.signup(body);
  }

  @Post('login')
  login(@Body() body: LoginRequest) {
    return this.authService.login(body);
  }

  @Post('profile/:id')
  updateProfile(@Body() body: { name?: string; email?: string; password?: string }, @Param('id') id: string) {
    return this.authService.updateProfile(id, body);
  }
}
