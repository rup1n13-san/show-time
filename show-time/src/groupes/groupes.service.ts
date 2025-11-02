import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupeDto } from './dto/create-groupe.dto';
import { UpdateGroupeDto } from './dto/update-groupe.dto';
import { PrismaService} from 'src/prisma/prisma.service';

@Injectable()
export class GroupesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupeDto: CreateGroupeDto) {
    return await this.prisma.prismaClient.groupe.create({
      data: {
        nom: createGroupeDto.nom,
      },
      select: {
        id: true,
        nom: true,
        createdAt: true,
        updatedAt: false,
      },
    });
  }

  async findAll() {
    return await this.prisma.prismaClient.groupe.findMany({
      select: {
        id: true,
        nom: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const groupe = await this.prisma.prismaClient.groupe.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!groupe) {
      throw new NotFoundException(`This groupe whth id ${id} dosen't exist.`);
    }

    return groupe;
  }

  async update(id: string, updateGroupeDto: UpdateGroupeDto) {
    const existing = await this.prisma.prismaClient.groupe.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`This groupe whth id ${id} dosen't exist.`);
    }

    return await this.prisma.prismaClient.groupe.update({
      where: { id },
      data: {
        nom: updateGroupeDto.nom,
      },
      select: {
        id: true,
        nom: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.prismaClient.groupe.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`This groupe whth id ${id} dosen't exist.`);
    }

    return await this.prisma.prismaClient.groupe.delete({
      where: { id },
      select: {
        id: true,
        nom: true,
        createdAt: true,
      },
    });
  }
}
