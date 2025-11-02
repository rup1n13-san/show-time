import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { env } from 'prisma/config';

interface ReservationData {
  userId: string;
  eventId: string;
  quantity: number;
}

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new ticket (unpaid reservation)
   * It checks event existence and capacity
   * @param data Data for the new ticket
   * @returns The created ticket object
   */
  async create(data: ReservationData) {
    const { userId, eventId, quantity } = data;
    const number_quantity = +quantity;

    if (!userId) {
      throw new BadRequestException('Invalid or missing fields: userId.');
    }
    if (!eventId) {
      throw new BadRequestException('Invalid or missing fields: eventId');
    }
    if (!number_quantity || number_quantity <= 0) {
      throw new BadRequestException(
        'Invalid or missing fields: quantity or unallowed quantity.',
      );
    }

    // Check if Event and User exist
    const event = await this.prisma.prismaClient.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found.`);
    }

    const user = await this.prisma.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // check Capacity
    if (
      event.numberOfSeats <= 0 ||
      event.numberOfSeats - number_quantity <= 0
    ) {
      throw new BadRequestException(
        `Event is sold out or Number remaining tickets is unsufficient. Only ${event.numberOfSeats} tickets remain.`,
      );
    }

    const existingTicketsCount = await this.prisma.prismaClient.ticket.count({
      where: { userId, eventId },
    });
    const totalTicketsAfterPurchase = existingTicketsCount + number_quantity;
    if (totalTicketsAfterPurchase > 10) {
      const remainingForUser = 10 - existingTicketsCount;
      throw new BadRequestException(
        `You can only buy a maximum of 10 tickets per event. You currently have ${existingTicketsCount}. You can buy ${remainingForUser} more.`,
      );
    }
    // get Price from event information
    const priceAtPurchase = event.price;
    const reservationId = new Date().getTime().toString();

    // create the ticket (isPaid defaults to false)
    const myTicktets = {};
    for (let i = 1; i <= number_quantity; i++) {
      const newTicket = await this.prisma.prismaClient.ticket.create({
        data: {
          userId,
          eventId,
          priceAtPurchase,
          pendingTransactionId: reservationId,
        },
      });
      // set ispaid to true
      const qrCodeLink = `${env('SITE_BASE_URL')}/${newTicket.id}/my-ticket`;
      await this.prisma.prismaClient.ticket.update({
        where: { id: newTicket.id },
        data: {
          isPaid: true,
          qrCodeLink: qrCodeLink,
          purchasedAt: new Date(),
        },
      });
      myTicktets[i] = newTicket;
    }

    // update event's sold tickets count
    await this.prisma.prismaClient.event.update({
      where: { id: eventId },
      data: {
        numberOfSeats: {
          decrement: number_quantity,
        },
      },
    });
    return {
      message: 'Reservation successful. Proceed to payment.',
      reservationId,
      totalAmount: event.price * number_quantity,
      tickets: myTicktets,
    };
  }

  /**
   * Finalizes the reservation by confirming payment.
   * @param id Ticket ID to update.
   */
  async confirmPayment(id: string) {
    const ticket = await this.prisma.prismaClient.ticket.findUnique({
      where: { id },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found.`);
    }
    if (ticket.isPaid) {
      throw new BadRequestException('Ticket is already paid and confirmed.');
    }
    // generate a link redirecting to booking
    const qrCodeLink = `${env('SITE_BASE_URL')}/${id}/my-ticket`;

    // update the ticket to paid and set the QR code link
    const updatedTicket = this.prisma.prismaClient.ticket.update({
      where: { id: ticket.id },
      data: {
        isPaid: true,
        qrCodeLink: qrCodeLink,
        purchasedAt: new Date(),
      },
      include: { user: true, event: true },
    });
    return {
      message: 'Payment successful.',
      ticket: updatedTicket,
    };
  }

  // async confirmPayment(id: string, transactionId: string) {
  //   const tickets = await this.prisma.prismaClient.ticket.findMany({
  //     where: { pendingTransactionId: transactionId },
  //   });

  //   for (const ticket of tickets) {
  //     if (!ticket) {
  //       throw new NotFoundException(`Ticket not found.`);
  //     }
  //     // with ID ${ticket.id}
  //     if (ticket.isPaid) {
  //       throw new BadRequestException('Ticket is already paid and confirmed.');
  //     }
  //     // generate a link redirecting to booking
  //     const qrCodeLink = `${env('SITE_BASE_URL')}/${ticket.id}/my-ticket`;

  //     // update the ticket to paid and set the QR code link
  //     const updatedTicket = this.prisma.prismaClient.ticket.update({
  //       where: { id: ticket.id },
  //       data: {
  //         isPaid: true,
  //         qrCodeLink: qrCodeLink,
  //         purchasedAt: new Date(),
  //       },
  //       include: { user: true, event: true },
  //     });
  //   }
  //   return { message: 'Successfull payment.' };
  // }

  async findAll() {
    return this.prisma.prismaClient.ticket.findMany({
      include: { user: true, event: true },
    });
  }

  async findUserTickets(userId: string) {
    const myTickets = await this.prisma.prismaClient.ticket.findMany({
      where: { userId: userId },
      orderBy: { purchasedAt: 'desc' },
      include: { event: true },
    });
    if (!myTickets) {
      throw new NotFoundException(`User ${userId} doesn't have any ticket yet`);
    }
    return myTickets;
  }

  async findOne(id: string) {
    const ticket = await this.prisma.prismaClient.ticket.findUnique({
      where: { id },
      include: { user: true, event: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found.`);
    }
    return ticket;
  }

  async remove(id: string) {
    try {
      // find the ticket to decrement the event's sold count later
      const ticket = await this.prisma.prismaClient.ticket.findUnique({
        where: { id },
      });
      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${id} not found.`);
      }

      // delete the ticket
      const deletedTicket = await this.prisma.prismaClient.ticket.delete({
        where: { id },
      });

      // increment event's remaining tickets count
      await this.prisma.prismaClient.event.update({
        where: { id: ticket.eventId },
        data: {
          numberOfSeats: {
            increment: 1,
          },
        },
      });

      return deletedTicket;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error during ticket removal:', error);
      throw new BadRequestException(
        'Could not remove ticket or update event capacity.',
      );
    }
  }

  async deleteAll() {
    await this.prisma.prismaClient.ticket.deleteMany({});
    return { message: 'All tickets registred are deleted successfully' };
  }
}
