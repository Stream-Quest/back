import { ApiProperty } from '@nestjs/swagger';
import { ResolutionResponseDto } from '../../resolution/dto/resolution-response.dto';
import { RuleResponseDto } from '../../rule/dto/rule-response.dto';
import { ResolutionMode } from '../../../generated/prisma/enums';

export class EventCountDto {
  @ApiProperty({ example: 2, description: 'Number of rules' })
  rules: number;

  @ApiProperty({ example: 3, description: 'Number of resolutions' })
  resolutions: number;
}

export class EventResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Wolf ambush',
    description: 'Event name',
  })
  name: string;

  @ApiProperty({
    example: -10,
    description: 'Karma value applied when this event is triggered',
  })
  karmaValue: number;

  @ApiProperty({
    example: false,
    description: 'Is this event a template ?',
  })
  isTemplate: boolean;

  @ApiProperty({
    example: false,
    description: 'Is this event public ?',
  })
  isPublic: boolean;

  @ApiProperty({
    enum: ResolutionMode,
    example: ResolutionMode.MJ_CHOICE,
    description: 'How the resolution is chosen when this event triggers',
  })
  resolutionMode: ResolutionMode;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'EventType UUID (foreign key)',
  })
  eventTypeId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Game master UUID (foreign key)',
  })
  gameMasterId: string;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}

export class DetailedEventResponseDto extends EventResponseDto {
  @ApiProperty({
    type: [RuleResponseDto],
    description: 'Rules that can trigger this event',
  })
  rules: RuleResponseDto[];

  @ApiProperty({
    type: [ResolutionResponseDto],
    description: 'Possible resolutions for this event',
  })
  resolutions: ResolutionResponseDto[];
}
