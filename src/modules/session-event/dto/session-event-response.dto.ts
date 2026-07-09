import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SessionEventOrigin,
  SessionEventStatus,
} from '../../../generated/prisma/enums';
import { DetailedEventResponseDto } from '../../event/dto/event-response.dto';
import { ResolutionResponseDto } from '../../resolution/dto/resolution-response.dto';

export class SessionEventResolutionResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'SessionEventResolution unique identifier',
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'SessionEvent UUID (foreign key)',
  })
  sessionEventId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Resolution UUID (foreign key)',
  })
  resolutionId: string;

  @ApiProperty({
    example: '2026-06-29T15:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-29T15:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}

export class SessionEventResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'SessionEvent unique identifier',
  })
  id: string;

  @ApiProperty({
    enum: SessionEventStatus,
    example: SessionEventStatus.PENDING,
    description: 'Current status of the session event',
  })
  status: SessionEventStatus;

  @ApiPropertyOptional({
    example: 'Une embuscade de bandits surgit des ombres !',
    description:
      'Custom message overriding the resolution message on the OBS overlay',
  })
  finalMessage: string | null;

  @ApiProperty({
    example: '2026-06-29T15:00:00.000Z',
    description: 'When the event was triggered',
  })
  triggeredAt: Date;

  @ApiPropertyOptional({
    example: '2026-06-29T15:05:00.000Z',
    description: 'When the GM resolved the event',
  })
  resolvedAt: Date | null;

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
  chosenResolutionId: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'Threshold event UUID if this session event was triggered by a karma threshold being reached',
  })
  thresholdEventId: string | null;

  @ApiProperty({
    enum: SessionEventOrigin,
    example: SessionEventOrigin.MANUAL,
    description: '',
  })
  origin: SessionEventOrigin;

  @ApiPropertyOptional({
    example: '_sinwha',
    description: '',
  })
  viewerLogin?: string | null;

  @ApiProperty({
    example: '2026-06-29T15:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-29T15:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}

export class DetailedSessionEventResponseDto extends SessionEventResponseDto {
  @ApiProperty({
    type: DetailedEventResponseDto,
    description: 'Full event details with rules and resolutions',
  })
  event: DetailedEventResponseDto;

  @ApiPropertyOptional({
    type: ResolutionResponseDto,
    description: 'The resolution chosen by the GM',
  })
  chosenResolution: ResolutionResponseDto | null;

  @ApiProperty({
    type: [SessionEventResolutionResponseDto],
    description: 'All resolutions proposed for this session event',
  })
  sessionEventResolutions: SessionEventResolutionResponseDto[];
}
