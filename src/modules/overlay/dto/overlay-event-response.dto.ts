import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SessionEventOrigin,
  SessionEventStatus,
} from '../../../generated/prisma/enums';

export class OverlayEventResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session event unique identifier',
  })
  id: string;

  @ApiProperty({
    enum: SessionEventStatus,
    example: SessionEventStatus.PENDING,
    description: 'Session event status',
  })
  status: SessionEventStatus;

  @ApiPropertyOptional({
    example: 'The party decided to flee the ambush',
    description: 'Final message describing the resolved event',
  })
  finalMessage?: string | null;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'When the event was triggered',
  })
  triggeredAt: Date;

  @ApiPropertyOptional({
    example: '2026-05-13T10:05:00.000Z',
    description: 'When the event was resolved',
  })
  resolvedAt?: Date | null;

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
    enum: SessionEventOrigin,
    example: SessionEventOrigin.MANUAL,
    description: 'Origin that triggered the event',
  })
  origin: SessionEventOrigin;

  @ApiPropertyOptional({
    example: 'viewer_login123',
    description: 'Twitch login of the viewer who triggered the event',
  })
  viewerLogin?: string | null;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session UUID (foreign key)',
  })
  sessionId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event UUID (foreign key)',
  })
  eventId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Chosen resolution UUID (foreign key)',
  })
  chosenResolutionId?: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Threshold event UUID (foreign key)',
  })
  thresholdEventId?: string | null;
}
