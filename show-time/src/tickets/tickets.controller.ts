import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Post,
  Render,
  BadRequestException,
  Res,
  Req,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PaymentsService } from 'src/payments/payments.service';
import type { Request, Response } from 'express';

// ensure incoming data match service data
interface ReservationBody {
  userId: string;
  eventId: string;
  quantity: number;
}
// interface ConfirmationBody {
//   reservationId: string;
//   transactionId: string;
// }

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: ReservationBody, @Res() res: Response) {
    const response = await this.ticketsService.create(data);
    // const ids = response.tickets.map((ticket) => {
    //   ticket.id
    // });
    await this.paymentsService.createPaymentAndRedirect(
      response.totalAmount,
      response.reservationId,
      res,
      response.tickets[1].id,
    );
    return response;
  }

  // update when ticket is paid
  @Patch(':id/confirm')
  @HttpCode(200)
  async confirmPayment(@Param('id') id: string) {
    return this.ticketsService.confirmPayment(id);
  }

  // get all tickets
  // should be accessible only by the admin
  findAll() {
    const tickets = this.ticketsService.findAll();
    return { tickets };
  }

  //get a user tickets by the user id: userId
  @Get('user/:id')
  findUserTickets(@Param('id') id: string) {
    return this.ticketsService.findUserTickets(id);
  }

  // get a ticket by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Get(':id/my-ticket')
  @Render('tickets/ticket-detail-view')
  async showticket(@Param('id') id: string) {
    const myTicket = this.ticketsService.findOne(id);
    return {
      ticket: await myTicket,
      event: (await myTicket).event,
      user: (await myTicket).user,
    };
  }

  // DELETE /tickets/:id
  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }

  @Get(':id/view-qrcode')
  @Render('tickets/ticket-qr-view')
  async viewQrCode(@Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id);
    const qrCodeDataValue = ticket.qrCodeLink;
    return {
      title: 'Your Confirmed Ticket',
      ticket: {
        ...ticket,
        qrCodeData: qrCodeDataValue,
      },
    };
  }

  @Delete()
  @HttpCode(201)
  deleteAll() {
    return this.ticketsService.deleteAll();
  }
}
