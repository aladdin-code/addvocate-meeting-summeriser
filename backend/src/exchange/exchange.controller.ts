import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '@/auth/decorators/get-user.decorator';

@Controller('exchanges')
@UseGuards(JwtAuthGuard)
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.exchangeService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.exchangeService.findOne(id, userId);
  }
}
