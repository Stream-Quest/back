import { ApiProperty } from '@nestjs/swagger';
import { ThresholdType } from '../../../generated/prisma/enums';
import { EventResponseDto } from '../../../event/dto/event-response.dto';

export class ThresholdEventResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'CampaignThresholdEvent unique identifier',
  })
  id: string;

  @ApiProperty({
    enum: ThresholdType,
    example: ThresholdType.CHAOS,
    description: 'Which threshold triggers this event',
  })
  thresholdType: ThresholdType;

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
    example: '2026-06-30T16:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-30T16:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}

export class DetailedThresholdEventResponseDto extends ThresholdEventResponseDto {
  @ApiProperty({
    type: EventResponseDto,
    description: 'Full event details',
  })
  event: EventResponseDto;
}
