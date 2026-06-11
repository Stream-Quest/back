import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateWeatherDto {
  @ApiProperty({
    example: 'Sunny',
    description: 'Session weather name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Sunny',
    description: 'Session weather displayed name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  displayName: string;

  @ApiPropertyOptional({
    example: 'A sunny day',
    description: 'Session weather description',
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://some-random.url/some-random-icon',
    description: 'Session weather icon URL',
  })
  @IsOptional()
  @MaxLength(255)
  @IsUrl()
  iconUrl?: string | null;
}
