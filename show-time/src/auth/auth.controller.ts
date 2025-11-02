import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('register')
  @Render('auth/register')
  renderRegister() {
    return { title: 'register', error: null };
  }

  @Get('login')
  @Render('auth/login')
  renderLogin() {
    return { title: 'login', error: null };
  }

  /**
   *
   * @param registerDto object
   * @returns send email verification and create later user
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const result = await this.authService.register(registerDto);

      // res.cookie('access_token', result.access_token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   maxAge: 72 * 60 * 60 * 1000, // 24 heures
      // });
      return res.redirect('/auth/login');
    } catch (error) {
      return res.render('auth/register', {
        error: error.message || "Une erreur est survenue lors de l'inscription",
        success: null,
      });
    }
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Query() verifyEmailDto: VerifyEmailDto,
    @Res() res: Response,
  ) {
    await this.authService.verifyEmail(verifyEmailDto);
    return res.redirect('/auth/login');
  }

  /**
   *
   * @param resendVerificationDto object
   * @returns message for verification again
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerificationEmail(resendVerificationDto);
  }

  /**
   *
   * @param loginDto object
   * @returns token and user logged
   */
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(loginDto);

      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie('user', JSON.stringify(result.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.redirect('/');
    } catch (error) {
      return res.render('auth/login', {
        error: error.message || 'Identifiants incorrects',
      });
    }
  }

  /**
   *
   * @param user object
   * @returns all information for current user
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return {
      user,
    };
  }

  @Get('/passwordreset')
  @Render('auth/passwordreset')
  changePasswordView() {
    return;
  }

  @Get('/reset-password')
  @Render('auth/newpassword')
  resetPassView() {
    return;
  }

  /**
   *
   * @param forgotPasswordDto object that contains last email
   * @returns send reset password email and succes message
   */

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  // Réinitialiser le mot de passe
  /**
   *
   * @param resetPasswordDto object that contain newPassword, password confirmation and token user
   * @returns change password in db and return succes message
   */

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('user');

    return res.redirect('/auth/login');
  }
}
