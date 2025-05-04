import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GptService } from '../gpt/gpt.service';
import { SummaryResponseDto } from '../gpt/dto/summary-response.dto';
import { SummarizeExchangeDto } from '@/gpt/dto/summarize.dto';
import { Prisma } from '@prisma/client';
import { UpdateSummaryDto } from './dto/update-summary.dto';

@Injectable()
export class SummaryService {
  constructor(
    private prisma: PrismaService,
    private gptService: GptService,
  ) {}

  async generateSummary(
    exchangeId: string,
    userId: string,
  ): Promise<SummaryResponseDto> {
    // Check if exchange exists
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: { messages: true },
    });

    if (!exchange) {
      throw new NotFoundException(`Exchange with ID ${exchangeId} not found`);
    }

    // Check if this user already has a summary for this exchange
    const existing = await this.prisma.summary.findUnique({
      where: { userId_exchangeId: { userId, exchangeId } },
    });

    // If a summary already exists, throw a conflict exception
    if (existing) {
      throw new ConflictException(
        `Summary for exchange ${exchangeId} already exists`,
      );
    }

    // Format messages into the DTO expected by GptService
    const exchangeSegments = exchange.messages.map((msg) => ({
      speaker: msg.speaker,
      speaker_id: msg.speakerId || 0, // Add default if not available
      words: [{ text: msg.text }],
    }));

    const summarizeDto = new SummarizeExchangeDto();
    summarizeDto.exchange = exchangeSegments;

    const summary = await this.gptService.summarizeExchange(summarizeDto);

    // Create new summary
    await this.prisma.summary.create({
      data: {
        exchangeId,
        userId,
        content: summary,
      },
    });

    return summary;
  }

  async getSummaries(userId: string): Promise<SummaryResponseDto[]> {
    const summaries = await this.prisma.summary.findMany({
      where: { userId },
    });

    return summaries.map((summary) => ({
      id: summary.id,
      ...this.validateAndConvertSummary(summary.content),
    }));
  }

  async updateSummary(
    summaryId: string,
    userId: string,
    updatedSummary: Partial<UpdateSummaryDto>,
  ): Promise<SummaryResponseDto> {
    // Check if summary exists and belongs to the specified user
    const existing = await this.prisma.summary.findFirst({
      where: {
        id: summaryId,
        userId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Summary with ID ${summaryId} not found for user ${userId}`,
      );
    }

    // Get the existing content and safely cast it
    const existingContent = existing.content as unknown as SummaryResponseDto;

    // Deep merge the existing content with the updates
    const mergedContent = this.deepMerge(existingContent, updatedSummary);

    // Update summary in database
    const updated = await this.prisma.summary.update({
      where: { id: summaryId },
      data: {
        content: mergedContent as unknown as Prisma.JsonValue,
        updatedAt: new Date(),
      },
    });

    return mergedContent;
  }

  // Improved deep merge that properly handles arrays
  private deepMerge(target: any, source: any): any {
    // Handle null or non-object values
    if (source === null || typeof source !== 'object') return source;
    if (target === null || typeof target !== 'object')
      return { ...target, ...source };

    const result = { ...target };

    Object.keys(source).forEach((key) => {
      // If property doesn't exist in target, just use source value
      if (!(key in target)) {
        result[key] = source[key];
        return;
      }

      // Special handling for arrays
      if (Array.isArray(source[key])) {
        // If source array has items, use it, otherwise keep target array
        result[key] = source[key].length > 0 ? source[key] : target[key];
        return;
      }

      // Recursive merge for objects
      if (typeof source[key] === 'object' && typeof target[key] === 'object') {
        result[key] = this.deepMerge(target[key], source[key]);
        return;
      }

      // For primitive types, use source value if defined, otherwise keep target value
      result[key] = source[key] !== undefined ? source[key] : target[key];
    });

    return result;
  }

  // Modify validation to handle partial updates
  private validateAndConvertSummary(data: any): SummaryResponseDto {
    try {
      // Check that at least one section exists
      if (
        !data.Overview &&
        !data.Notes &&
        !data.ActionItems &&
        !data.FollowUpEmail
      ) {
        throw new Error('Summary must include at least one section');
      }

      // Create a base structure with default empty values
      const summary: SummaryResponseDto = {
        Overview: {
          Purpose: '',
          KeyTopics: [],
          Conclusions: '',
        },
        Notes: [],
        ActionItems: [],
        FollowUpEmail: {
          To: '',
          Body: '',
        },
      };

      // Merge in any provided data
      if (data.Overview) {
        summary.Overview.Purpose =
          data.Overview.Purpose || summary.Overview.Purpose;
        summary.Overview.KeyTopics = Array.isArray(data.Overview.KeyTopics)
          ? data.Overview.KeyTopics
          : summary.Overview.KeyTopics;
        summary.Overview.Conclusions =
          data.Overview.Conclusions || summary.Overview.Conclusions;
      }

      if (data.Notes && Array.isArray(data.Notes)) {
        summary.Notes = data.Notes.map((note) => ({
          Theme: note.Theme || '',
          Details: note.Details || '',
        }));
      }

      if (data.ActionItems && Array.isArray(data.ActionItems)) {
        summary.ActionItems = data.ActionItems.map((item) => ({
          Name: item.Name || '',
          Responsibility: item.Responsibility || '',
        }));
      }

      if (data.FollowUpEmail) {
        summary.FollowUpEmail.To =
          data.FollowUpEmail.To || summary.FollowUpEmail.To;
        summary.FollowUpEmail.Body =
          data.FollowUpEmail.Body || summary.FollowUpEmail.Body;
      }

      return summary;
    } catch (error) {
      throw new BadRequestException('Invalid summary format: ' + error.message);
    }
  }
}
