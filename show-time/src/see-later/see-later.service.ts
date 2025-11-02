import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface SeeLaterData {
  userId: string;
  eventId: string;
}

@Injectable()
export class SeeLaterService {
  constructor(private prisma: PrismaService) {}
  /**
   * Creates a new see later object
   * @param data Data for the new see later
   * @returns The created see-later object
   */
  async create(data: SeeLaterData) {
    const { userId, eventId } = data;
    if (!userId || !eventId) {
      throw new BadRequestException(
        'Missing required fields: userId or eventId.',
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

    // check if the event is already registred
    const seeLater = await this.prisma.prismaClient.user_Event.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId,
        },
      },
    });
    if (seeLater) {
      throw new BadRequestException(`Event already registred in see Later`);
    }

    // create the ticket (isPaid defaults to false)
    const newSeeLater = await this.prisma.prismaClient.user_Event.create({
      data: {
        userId,
        eventId,
      },
    });
    return newSeeLater;
  }

  async findAll(id: string) {
    return this.prisma.prismaClient.user_Event.findMany({
      where: { userId: id },
      orderBy: { registredAt: 'desc' },
      include: { user: true, event: true },
    });
  }

  async findOne(id: string) {
    const seeLater = await this.prisma.prismaClient.user_Event.findUnique({
      where: { id },
      include: { user: true, event: true },
    });
    if (!seeLater) {
      throw new NotFoundException(`Ticket with ID ${id} not found.`);
    }
    return seeLater;
  }

  async remove(id: string) {
    try {
      const seeLater = await this.prisma.prismaClient.user_Event.findUnique({
        where: { id },
      });
      if (!seeLater) {
        throw new NotFoundException(`Event not found.`);
      }

      // delete a registred event in see later
      const deletedSeeLater = await this.prisma.prismaClient.user_Event.delete({
        where: { id },
      });

      return deletedSeeLater;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      //handle case where Event update might fail if Event was also deleted
      console.error('Error during ticket removal:', error);
      throw new BadRequestException('Could not remove this registred event.');
    }
  }

  // delete all event registred in see later list
  async deleteAll() {
    await this.prisma.prismaClient.user_Event.deleteMany({});
    return { message: 'All events registred are deleted successfully' };
  }
}
