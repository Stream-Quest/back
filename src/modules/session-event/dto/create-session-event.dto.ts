import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SessionEventOrigin } from '../../../generated/prisma/enums';

export class CreateSessionEventDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event UUID to trigger',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiPropertyOptional({
    example: '2026-06-29T15:00:00.000Z',
    description: 'When the event was triggered (defaults to now)',
  })
  @IsDateString()
  @IsOptional()
  triggeredAt?: string;

  @ApiProperty({
    enum: SessionEventOrigin,
    example: SessionEventOrigin.MANUAL,
    description:
      'Origin of the session event (Twitch webhook, GM manual trigger, or karma threshold)',
  })
  @IsEnum(SessionEventOrigin)
  @IsNotEmpty()
  origin: SessionEventOrigin;

  @ApiPropertyOptional({
    example: '_sinwha',
    description:
      'Twitch username of the viewer who triggered the event (only set when origin is TWITCH)',
  })
  @IsString()
  @IsOptional()
  viewerLogin?: string | null;
}
