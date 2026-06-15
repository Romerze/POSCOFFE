import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocalDto, UpdateLocalDto } from './dto/local.dto';

@Injectable()
export class LocalsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.local.findMany({ orderBy: { creadoEn: 'asc' } });
  }

  async findOne(id: string) {
    const local = await this.prisma.local.findUnique({ where: { id } });
    if (!local) throw new NotFoundException('Local no encontrado');
    return local;
  }

  create(dto: CreateLocalDto) {
    return this.prisma.local.create({ data: dto });
  }

  async update(id: string, dto: UpdateLocalDto) {
    await this.findOne(id);
    return this.prisma.local.update({ where: { id }, data: dto });
  }
}
