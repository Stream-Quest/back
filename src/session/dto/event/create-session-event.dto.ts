import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

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
}
