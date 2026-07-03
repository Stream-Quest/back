import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KarmaEventResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Karma unique identifier',
  })
  id: string;

  @ApiProperty({
    example: -10,
    description: 'Karma value applied (positive = blessing, negative = chaos)',
  })
  value: number;

  @ApiPropertyOptional({
    example: 'Wolf Ambush',
    description: 'Reason for this karma change',
  })
  reason: string | null;

  @ApiProperty({
    example: '2026-06-30T16:00:00.000Z',
    description: 'When this karma change occurred',
  })
  occurredAt: Date;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Campaign UUID (foreign key)',
  })
  campaignId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session UUID (foreign key, null if manual adjustment)',
  })
  sessionId: string | null;
}
