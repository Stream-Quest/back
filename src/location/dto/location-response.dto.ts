import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'FOREST',
    description: 'Session location name',
  })
  name: string;

  @ApiProperty({
    example: 'Forest',
    description: 'Session location displayed name',
  })
  displayName: string;

  @ApiPropertyOptional({
    example: 'A simple forest',
    description: 'Session location description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://some-random.url/some-random-image',
    description: 'Session location image URL',
  })
  imageUrl?: string | null;

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
