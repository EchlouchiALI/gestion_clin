import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterPatientDto } from './dto/register-patient.dto'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Route : POST /auth/register
  @Post('register')
  async register(@Body() body: RegisterPatientDto) {
    return this.authService.registerPatient(body)
  }

  // ✅ Route : POST /auth/login
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body)
  }

  // ✅ Route : POST /auth/forgot-password
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendResetCode(email)
  }

  // ✅ Route : POST /auth/verify-reset-code
  @Post('verify-reset-code')
  async verifyCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyResetCode(body.email, body.code)
  }

  // ✅ Route : POST /auth/reset-password
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; code: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword)
  }
}
