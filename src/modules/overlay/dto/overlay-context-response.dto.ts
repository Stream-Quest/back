import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeOfDay } from '../../../generated/prisma/enums';
import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';
import { LocationResponseDto } from '../../location/dto/location-response.dto';

export class OverlayContextResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Context snapshot unique identifier',
  })
  id: string;

  @ApiPropertyOptional({
    enum: TimeOfDay,
    example: TimeOfDay.DAY,
    description: 'Time of day at the time of the snapshot',
  })
  timeOfDay?: TimeOfDay | null;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'When the snapshot was taken',
  })
  snapshotAt: Date;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Weather UUID (foreign key)',
  })
  weatherId?: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Location UUID (foreign key)',
  })
  locationId?: string | null;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session UUID (foreign key)',
  })
  sessionId: string;

  @ApiPropertyOptional({
    type: () => WeatherResponseDto,
    description: 'Weather attached to this snapshot',
  })
  weather?: WeatherResponseDto | null;

  @ApiPropertyOptional({
    type: () => LocationResponseDto,
    description: 'Location attached to this snapshot',
  })
  location?: LocationResponseDto | null;
}
