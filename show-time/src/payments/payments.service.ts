import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'STRIPE_SECRET_KEY',
      {
        apiVersion: '2025-10-29.clover',
      },
    );
  }
  async createPaymentAndRedirect(
    amount: number,
    item: string,
    res: Response,
    id: string,
  ) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: item },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/tickets/${id}/view-qrcode`,
      cancel_url: 'http://localhost:3000/payments/failure',
    });

    return res.redirect(303, session.url || 'http://localhost:3000');
  }
}
