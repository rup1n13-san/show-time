import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Password don't match");
    }

    const existingEmail = await this.prisma.prismaClient.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new BadRequestException('This email is already used');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Générer un token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Expire dans 24h

    const user = await this.prisma.prismaClient.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Envoyer l'email de vérification
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.username,
      );
    } catch (error) {
      console.error('Error sending email: ', error);
      // On ne bloque pas l'inscription même si l'email échoue
    }

    return {
      message:
        'Registration successful! A verification email has been sent to your address.',
      user,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.prismaClient.user.findFirst({
      where: {
        emailVerificationToken: dto.token,
        emailVerificationExpires: {
          gte: new Date(), // Token non expiré
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Marquer l'email comme vérifié
    const updatedUser = await this.prisma.prismaClient.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isEmailVerified: true,
      },
    });

    // Envoyer l'email de bienvenue
    try {
      await this.emailService.sendWelcomeEmail(
        updatedUser.email,
        updatedUser.username,
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }

    // Générer le token JWT
    const token = this.generateToken(
      updatedUser.id,
      updatedUser.email,
      updatedUser.role,
    );

    return {
      message: 'Email verified successfully!',
      user: updatedUser,
      access_token: token,
    };
  }

  async resendVerificationEmail(dto: ResendVerificationDto) {
    const user = await this.prisma.prismaClient.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Générer un nouveau token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await this.prisma.prismaClient.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Renvoyer l'email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.username,
    );

    return {
      message: 'A new verification email has been sent.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.prismaClient.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('incorrect email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('incorrect email or password');
    }

    //  Vérifier que l'email est vérifié
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please check your email before logging in. A verification email has been sent to you.',
      );
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      access_token: token,
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  //Demander la réinitialisation du mot de passe
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.prismaClient.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        message: 'If this email exist, reset link are send.',
      };
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expire dans 1 heure

    await this.prisma.prismaClient.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Envoyer l'email de réinitialisation
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.username,
      );
    } catch (error) {
      console.error('Error send email:', error);
      throw new BadRequestException('Impossible to send reset email ');
    }

    return {
      message: 'If this email exist, reset link are send.',
    };
  }

  // Réinitialiser le mot de passe
  async resetPassword(token: string, dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException("Password don't macth");
    }

    // Trouver l'utilisateur avec le token valide
    const user = await this.prisma.prismaClient.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(), // Token non expiré
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid Token ');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Mettre à jour le mot de passe et supprimer le token
    await this.prisma.prismaClient.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Envoyer l'email de confirmation
    try {
      await this.emailService.sendPasswordChangedEmail(
        user.email,
        user.username,
      );
    } catch (error) {
      console.error('Error send email:', error);
    }

    return {
      message:
        'Your password has been successfully changed. You can now log in.',
    };
  }
}
