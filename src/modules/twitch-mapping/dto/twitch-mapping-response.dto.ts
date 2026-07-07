import { ApiProperty } from '@nestjs/swagger';
import { TriggerType } from '../../../generated/prisma/enums';
import { EventResponseDto } from '../../event/dto/event-response.dto';

export class TwitchMappingResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'TwitchEventMapping unique identifier',
  })
  id: string;

  @ApiProperty({
    enum: TriggerType,
    example: TriggerType.SUB_TIER1,
    description: 'Twitch event type that triggers this mapping',
  })
  twitchEventType: TriggerType;

  @ApiProperty({
    example: true,
    description: 'Whether this mapping is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: 5,
    description: 'Number of Twitch events required before triggering',
  })
  threshold: number;

  @ApiProperty({
    example: 3,
    description: 'Current count of received Twitch events',
  })
  currentCount: number;

  @ApiProperty({
    example: true,
    description: 'Whether to show progress on the OBS overlay',
  })
  showProgress: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Campaign UUID (foreign key)',
  })
  campaignId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event UUID (foreign key)',
  })
  eventId: string;

  @ApiProperty({
    example: '2026-07-05T10:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-05T10:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}

export class DetailedTwitchMappingResponseDto extends TwitchMappingResponseDto {
  @ApiProperty({
    type: EventResponseDto,
    description: 'Full event details',
  })
  event: EventResponseDto;
}
