import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OverviewDto {
  @IsString()
  @IsNotEmpty()
  Purpose: string;

  @IsArray()
  @IsString({ each: true })
  KeyTopics: string[];

  @IsString()
  @IsNotEmpty()
  Conclusions: string;
}

class NoteDto {
  @IsString()
  @IsNotEmpty()
  Theme: string;

  @IsString()
  @IsNotEmpty()
  Details: string;
}

class ActionItemDto {
  @IsString()
  @IsNotEmpty()
  Name: string;

  @IsString()
  @IsNotEmpty()
  Responsibility: string;
}

class FollowUpEmailDto {
  @IsString()
  @IsNotEmpty()
  To: string;

  @IsString()
  @IsNotEmpty()
  Body: string;
}

export class CreateSummaryDto {
  @IsObject()
  @ValidateNested()
  @Type(() => OverviewDto)
  Overview: OverviewDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteDto)
  Notes: NoteDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionItemDto)
  ActionItems: ActionItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => FollowUpEmailDto)
  FollowUpEmail: FollowUpEmailDto;
}
