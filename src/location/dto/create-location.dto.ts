import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Forest',
    description: 'Session location name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Forest',
    description: 'Session location displayed name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  displayName: string;

  @ApiPropertyOptional({
    example: 'A simple forest',
    description: 'Session location description',
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://some-random.url/some-random-image',
    description: 'Session location image URL',
  })
  @IsOptional()
  @MaxLength(255)
  @IsUrl()
  imageUrl?: string | null;
}
