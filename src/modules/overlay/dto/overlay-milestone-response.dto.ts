import { ApiProperty } from '@nestjs/swagger';
import { TriggerType } from '../../../generated/prisma/enums';

class OverlayMilestoneEventDto {
  @ApiProperty({
    example: 'Dragon awakens',
    description: 'Name of the event tied to this milestone',
  })
  name: string;
}

export class OverlayMilestoneResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Twitch event mapping unique identifier',
  })
  id: string;

  @ApiProperty({
    enum: TriggerType,
    example: TriggerType.SUB_TIER1,
    description: 'Twitch trigger type tracked by this milestone',
  })
  twitchEventType: TriggerType;

  @ApiProperty({
    example: true,
    description: 'Whether this milestone is currently active',
  })
  isActive: boolean;

  @ApiProperty({
    example: 10,
    description: 'Number of triggers required to reach the milestone',
  })
  threshold: number;

  @ApiProperty({
    example: 4,
    description: 'Current number of triggers counted towards the threshold',
  })
  currentCount: number;

  @ApiProperty({
    example: true,
    description: 'Whether progress should be displayed on the overlay',
  })
  showProgress: boolean;

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
    type: () => OverlayMilestoneEventDto,
    description: 'Event tied to this milestone',
  })
  event: OverlayMilestoneEventDto;
}
