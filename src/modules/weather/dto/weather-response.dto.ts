import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WeatherResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'SUNNY',
    description: 'Session weather name',
  })
  name: string;

  @ApiProperty({
    example: 'Sunny',
    description: 'Session weather displayed name',
  })
  displayName: string;

  @ApiPropertyOptional({
    example: 'A sunny day',
    description: 'Session weather description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://some-random.url/some-random-icon',
    description: 'Session weather icon URL',
  })
  iconUrl?: string | null;

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
