import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummariesController } from './summary.controller';
import { GptModule } from '../gpt/gpt.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [GptModule, PrismaModule],
  controllers: [SummariesController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
