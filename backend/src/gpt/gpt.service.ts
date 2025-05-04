import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SummarizeExchangeDto } from './dto/summarize.dto';
@Injectable()
export class GptService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(GptService.name);

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async summarizeExchange(dto: SummarizeExchangeDto): Promise<any> {
    try {
      console.log('test');
      const formattedExchange = this.formatExchangeContent(dto.exchange);

      this.logger.log('Sending exchange to OpenAI for summarization');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI meeting summarizer. You will be given a transcript of a meeting exchange.
            Analyze the conversation and generate a comprehensive summary in the exact JSON format specified below:
            
            {
              "Overview":{
                "Purpose": "the purpose text here...",
                "KeyTopics":[ "key topic here..", "key topic here ...", "", "..." ],
                "Conclusions": "Conclusion text here ....."
              },
              "Notes":[
                {"Theme": "the note theme...", "Details": "the note text...." },
                {"Theme": "the note theme...", "Details": "the note text...." },
                "...."
              ],
              "ActionItems":[
                {"Name": "name of the person", "Responsibility": "the action responsible for text.." },
                {"Name": "name of the person", "Responsibility": "the action responsible for text.." },
                "...."
              ],
              "FollowUpEmail":{
                "To": "the name of the person", 
                "Body": "text of the followup email email..."
              }
            }
            
            Respond only with the JSON object, no introduction or extra text.`,
          },
          {
            role: 'user',
            content: `Here is the meeting transcript: ${formattedExchange}`,
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const summaryContent = response.choices[0].message.content;
      this.logger.log('Successfully received summary from OpenAI');

      return JSON.parse(summaryContent);
    } catch (error) {
      this.logger.error(`Error summarizing exchange: ${error.message}`);
      throw error;
    }
  }

  private formatExchangeContent(exchange: any[]): string {
    try {
      return exchange
        .map((segment) => {
          const speakerName = segment.speaker || 'Unknown Speaker';
          const text = segment.words.map((word) => word.text).join('');
          return `${speakerName}: ${text}`;
        })
        .join('\n');
    } catch (error) {
      this.logger.error(`Error formatting exchange: ${error.message}`);
      throw new Error('Failed to format exchange content');
    }
  }
}
