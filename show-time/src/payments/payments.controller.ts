import { Controller, Get, Res, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private config: ConfigService,
  ) {}

  /* ============= Use example of payment */

  // ;) don't forget to import the service in the file where you want to use it and the paymentsModule in the your current module

  // @Get('/test')
  // async testPayment(@Res() res: Response) {
  //   const result = await this.paymentsService.createPaymentAndRedirect(100, 'item', res); // <-- this is the line to add
  //   // use this card number for the test 4242424242424242
  // }

  /* ============= END - Use example of payment */

  @Get('failure')
  @Render('payments/failure')
  failure(@Res() res: Response) {
    return res.render('payments/failure');
  }
}
