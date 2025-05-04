export class OverviewDto {
  Purpose: string;
  KeyTopics: string[];
  Conclusions: string;
}

export class NoteDto {
  Theme: string;
  Details: string;
}

export class ActionItemDto {
  Name: string;
  Responsibility: string;
}

export class FollowUpEmailDto {
  To: string;
  Body: string;
}

export class SummaryResponseDto {
  Overview: OverviewDto;
  Notes: NoteDto[];
  ActionItems: ActionItemDto[];
  FollowUpEmail: FollowUpEmailDto;
}
