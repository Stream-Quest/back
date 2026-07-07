import { ApiProperty } from '@nestjs/swagger';
import { EventResponseDto } from '../../event/dto/event-response.dto';

export class CampaignEventResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'CampaignEvent unique identifier',
  })
  id: string;

  @ApiProperty({
    example: true,
    description: 'Is this event active for this campaign ?',
  })
  isActive: boolean;

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

export class DetailedCampaignEventResponseDto extends CampaignEventResponseDto {
  @ApiProperty({
    type: EventResponseDto,
    description: 'Full event details',
  })
  event: EventResponseDto;
}
