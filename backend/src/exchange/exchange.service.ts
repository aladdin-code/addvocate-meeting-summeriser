import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponseDto } from '../common/dto/pagination-response.dto';

@Injectable()
export class ExchangeService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<any>> {
    const { skip, limit, page } = paginationDto;

    const [exchanges, total] = await Promise.all([
      this.prisma.exchange.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          messages: false,
        },
      }),
      this.prisma.exchange.count(),
    ]);

    return new PaginationResponseDto(exchanges, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const exchange = await this.prisma.exchange.findUnique({
      where: { id },
      include: {
        messages: true,
        summaries: {
          where: {
            userId: userId,
          },
          select: {
            content: true,
            id: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
      },
    });

    if (!exchange) {
      throw new NotFoundException(`Exchange with ID ${id} not found`);
    }

    return exchange;
  }
  async create(title: string, messages: any[]) {
    return this.prisma.exchange.create({
      data: {
        title,
        messages: {
          create: messages.map((message) => ({
            text: message.text,
            speaker: message.speaker,
            speakerId: message.speakerId,
          })),
        },
      },
    });
  }
}
