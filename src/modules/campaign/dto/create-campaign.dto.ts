import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { JsonValue } from '@prisma/client/runtime/client';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({
    example: 'Campaign n°1',
    description: 'Campaign title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'A classic D&D campaign',
    description: 'Campaign description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: -100,
    description: 'Chaos threshold (karma value triggering chaos event)',
  })
  @IsInt()
  chaosThreshold: number;

  @ApiProperty({
    example: 100,
    description: 'Blessing threshold (karma value triggering blessing event)',
  })
  @IsInt()
  blessingThreshold: number;

  @ApiPropertyOptional({
    description:
      'Overlay theme configuration (reserved for v2 — custom colors, fonts and preset themes)',
    example: { preset: 'nordic', primaryColor: '#C9A84C' },
  })
  @IsObject()
  @IsOptional()
  overlayTheme?: JsonValue;
}
