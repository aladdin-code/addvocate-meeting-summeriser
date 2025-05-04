import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Word {
  @IsNotEmpty()
  text: string;
}

class ExchangeSegment {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Word)
  words: Word[];

  @IsNotEmpty()
  speaker: string;

  speaker_id: number;
}

export class SummarizeExchangeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExchangeSegment)
  exchange: ExchangeSegment[];
}
