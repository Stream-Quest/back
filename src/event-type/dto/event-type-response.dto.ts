import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventTypeResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event type unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Wolf embuscade',
    description: "Event type's name",
  })
  name: string;

  @ApiPropertyOptional({
    example:
      'An embuscade of wolves triggered when TimeOfDay is NIGHT and Location is FOREST',
    description: "Event type's description",
  })
  description?: string | null;

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
    description: 'User UUID (foreign key)',
  })
  createdById: string;
}
