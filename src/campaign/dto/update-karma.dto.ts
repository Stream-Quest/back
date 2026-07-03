import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateKarmaDto {
  @ApiProperty({
    example: 10,
    description: 'Karma value to apply (positive = blessing, negative = chaos)',
  })
  @IsInt()
  @IsNotEmpty()
  karmaValue: number;

  @ApiPropertyOptional({
    example: 'Récompense pour bravoure',
    description: 'Reason for this karma adjustment',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  reason?: string;
}
