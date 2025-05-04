import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SummaryResponseDto } from '../gpt/dto/summary-response.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private readonly summaryService: SummaryService) {}

  // Generate a new summary for a specific exchange
  @Post(':exchangeId/generate')
  async generateSummary(
    @Param('exchangeId') exchangeId: string,
    @GetUser('userId') userId: string,
  ): Promise<SummaryResponseDto> {
    return this.summaryService.generateSummary(exchangeId, userId);
  }

  // Retrieve the current user summaries
  @Get()
  async getSummary(
    @GetUser('userId') userId: string,
  ): Promise<SummaryResponseDto[]> {
    return this.summaryService.getSummaries(userId);
  }

  // Update the summary manually
  @Put(':summaryId')
  async updateSummary(
    @Param('summaryId') summaryId: string,
    @GetUser('userId') userId: string,
    @Body() updatedSummary: UpdateSummaryDto,
  ): Promise<SummaryResponseDto> {
    return this.summaryService.updateSummary(summaryId, userId, updatedSummary);
  }
}
