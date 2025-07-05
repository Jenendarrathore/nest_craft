import {
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SignUpDto } from '../dtos/sign-up.dto';
import { Public } from '../decorators/public.decorator';
import { SignInDto } from '../dtos/sign-in.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { VerifyResetCodeDto } from '../dtos/verify-reset-code.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  async signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('signin')
  async login(@Body() dto: SignInDto) {
    return this.authService.signin(dto);
  }

  @Public()
  @Post('refresh-token')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Request password reset OTP' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  // src/iam/controllers/auth.controller.ts
  @Post('verify-reset-code')
  @ApiOperation({ summary: 'Verify password reset OTP' })
  @Public()
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(dto);
  }

  // src/iam/controllers/auth.controller.ts
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using OTP' })
  @Public()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }


  @Post('refresh-token')
  logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }

}
