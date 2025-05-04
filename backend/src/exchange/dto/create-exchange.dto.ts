import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Word {
  @IsString()
  @IsNotEmpty()
  text: string;
}

class ExchangeSegment {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Word)
  words: Word[];

  @IsString()
  @IsNotEmpty()
  speaker: string;

  speaker_id: number;
}

export class CreateExchangeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExchangeSegment)
  content: ExchangeSegment[];
}
