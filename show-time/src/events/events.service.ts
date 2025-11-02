import { Injectable } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FilterEventDto, SortBy, SortOrder } from './dto/filter-event.dto';
import { UpdateEventDto } from './dto/update-user.dto';
import { EventType } from './enum/event-type.enum';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Event[]> {
    const events = await this.prisma.prismaClient.event.findMany();
    return events;
  }

  async findOne(id: string): Promise<Event | null> {
    return await this.prisma.prismaClient.event.findUnique({ where: { id } });
  }

  async create(data: CreateEventDto) {
    const { groupIds, ...eventData } = data;

    const event = await this.prisma.prismaClient.event.create({
      data: {
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
      },
    });

    if (groupIds && groupIds.length > 0) {
      await this.addGroupsToEvent(event.id, groupIds);
    }

    // Retourner l'événement avec ses groupes
    return await this.findOneWithGroups(event.id);
  }

  async update(id: string, data: UpdateEventDto): Promise<Event> {
    const updateData: any = { ...data };

    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    return await this.prisma.prismaClient.event.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Event> {
    return await this.prisma.prismaClient.event.delete({ where: { id } });
  }

  async addGroupsToEvent(eventId: string, groupIds: string[]) {
    const eventGroups = await Promise.all(
      groupIds.map(async (groupeId) => {
        return await this.prisma.prismaClient.event_group.create({
          data: {
            eventId,
            groupeId,
          },
        });
      }),
    );

    return {
      message: 'Groupes associés avec succès',
      eventGroups,
    };
  }

  async findOneWithGroups(id: string) {
    return await this.prisma.prismaClient.event.findUnique({
      where: { id },
      include: {
        Event_group: {
          include: {
            groupe: true,
          },
        },
      },
    });
  }

  async findAllWithFilters(filters: FilterEventDto) {
    const {
      search,
      typeEvent,
      location,
      minPrice,
      maxPrice,
      groupIds,
      sortBy = SortBy.START_DATE,
      sortOrder = SortOrder.ASC,
    } = filters;

    // Construction du filtre WHERE
    const where: Prisma.EventWhereInput = {
      AND: [],
    };

    // Recherche textuelle (titre ou description)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtre par type d'événement
    if (typeEvent) {
      (where.AND as Prisma.EventWhereInput[]).push({
        typeEvent: { equals: typeEvent.toUpperCase() as EventType },
      });
    }

    // Filtre par localisation
    if (location) {
      (where.AND as Prisma.EventWhereInput[]).push({
        location: { contains: location, mode: 'insensitive' },
      });
    }

    // Filtre par prix
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Prisma.FloatFilter = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
      (where.AND as Prisma.EventWhereInput[]).push({ price: priceFilter });
    }

    // Filtre par groupes
    if (groupIds && groupIds.length > 0) {
      (where.AND as Prisma.EventWhereInput[]).push({
        Event_group: {
          some: {
            groupeId: { in: groupIds },
          },
        },
      });
    }

    // Nettoyer le filtre AND s'il est vide
    if ((where.AND as Prisma.EventWhereInput[]).length === 0) {
      delete where.AND;
    }

    // Construction du tri
    const orderBy: Prisma.EventOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };
    //console.log('Filter WHERE clause:', JSON.stringify(where, null, 2));
    // Exécution de la requête avec comptage total
    const [events, total] = await Promise.all([
      this.prisma.prismaClient.event.findMany({
        where,
        orderBy,
        include: {
          Event_group: {
            include: {
              groupe: true,
            },
          },
          Ticket: {
            select: {
              id: true,
            },
          },
        },
      }),
      this.prisma.prismaClient.event.count({ where }),
    ]);

    return {
      events,
      total,
    };
  }
}
