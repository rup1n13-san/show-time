import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create_users.dto';
import { UpdateUserDto } from './dto/update_users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.prismaClient.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.prismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`The user with the ID ${id} cannot be found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    // Vérifier si l'email existe déjà
    const existingEmail = await this.prisma.prismaClient.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('This email is already used');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return await this.prisma.prismaClient.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Vérifie si existe

    const updateData: any = { ...updateUserDto };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email) {
      const existingEmail = await this.prisma.prismaClient.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('This email is already used');
      }
    }

    return await this.prisma.prismaClient.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Vérifie si existe

    await this.prisma.prismaClient.user.delete({
      where: { id },
    });

    return { message: 'User successfully deleted' };
  }

  async addGroupsToUser(userId: string, groupIds: string[]) {
    const userGroups = await Promise.all(
      groupIds.map(async (groupeId) => {
        return await this.prisma.prismaClient.user_group.create({
          data: {
            userId,
            groupeId,
          },
        });
      }),
    );

    return {
      message: 'Groupes associés avec succès',
      userGroups,
    };
  }

  async findUserWithGroups(id: string) {
    return await this.prisma.prismaClient.user.findUnique({
      where: { id },
      include: {
        User_group: {
          include: {
            groupe: true,
          },
        },
      },
    });
  }

  async getDistinctEventCount(userId: string) {
    const events = await this.prisma.prismaClient.ticket.findMany({
      where: { userId },
      distinct: ['eventId'],
    });

    return events.length;
  }

  async getUserSavedEvents(userId: string) {
    return await this.prisma.prismaClient.user_Event.findMany({
      where: { userId },
      include: {
        event: true, // Récupère les informations de l'évènement
      },
    });
  }

  async getNumberOfEventSaved(userId: string) {
    const events = await this.getUserSavedEvents(userId);
    return events.length;
  }

  async getTotalfavoritesGroups(userId: string) {
    const groups = await this.prisma.prismaClient.user_group.findMany({
      where: { userId },
      include: {
        groupe: true, // Récupère les informations du groupe
      },
    });

    return { groups, total: groups.length };
  }
}
