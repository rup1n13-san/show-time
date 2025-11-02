import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Configuration du transporteur email
    // Pour le développement, on utilise Mailtrap ou Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, username: string) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@showtime.com',
      to: email,
      subject: 'Vérification de votre compte ShowTime',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bonjour ${username},</h2>
          <p>Merci de vous être inscrit sur ShowTime !</p>
          <p>Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Vérifier mon email
          </a>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p>${verificationUrl}</p>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">ShowTime - Réservation de billets d'événements</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      //console.log(`Email de vérification envoyé à ${email}`);
    } catch (error) {
      //console.error("Erreur lors de l'envoi de l'email:", error);
      throw new Error("Impossible d'envoyer l'email de vérification");
    }
  }

  async sendWelcomeEmail(email: string, username: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@showtime.com',
      to: email,
      subject: 'Bienvenue sur ShowTime !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bienvenue ${username} ! </h2>
          <p>Votre compte a été vérifié avec succès.</p>
          <p>Vous pouvez maintenant profiter de toutes les fonctionnalités de ShowTime :</p>
          <ul>
            <li>Réserver des tickets pour vos événements préférés</li>
            <li>Gérer vos réservations</li>
            <li>Recevoir des notifications</li>
          </ul>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="display: inline-block; padding: 10px 20px; background-color: #2196F3; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Se connecter
          </a>
          <p>À très bientôt !</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
    }
  }

  //Email de réinitialisation de mot de passe
  async sendPasswordResetEmail(email: string, token: string, username: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@showtime.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe ShowTime',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bonjour ${username},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #FF9800; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p>${resetUrl}</p>
          <p><strong>Ce lien expirera dans 1 heure.</strong></p>
          <p style="color: #d32f2f; margin-top: 20px;">
             Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
            Votre mot de passe actuel reste inchangé.
          </p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">ShowTime - Réservation de billets d'événements</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(` Reset email sent to ${email}`);
    } catch (error) {
      console.error(" Error sending email:", error);
      throw new Error("Impossible to send reset email");
    }
  }

  // Email de confirmation de changement de mot de passe
  async sendPasswordChangedEmail(email: string, username: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@showtime.com',
      to: email,
      subject: 'Votre mot de passe a été modifié',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bonjour ${username},</h2>
          <p>Votre mot de passe a été modifié avec succès.</p>
          <p>Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="display: inline-block; padding: 10px 20px; background-color: #2196F3; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Se connecter
          </a>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">ShowTime - Réservation de billets d'événements</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email confirmation:', error);
    }
  }
}
