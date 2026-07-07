import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventTypeDto {
  @ApiProperty({
    example: 'Wolf embuscade',
    description: "Event type's name",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example:
      'An embuscade of wolves triggered when TimeOfDay is NIGHT and Location is FOREST',
    description: "Event type's description",
  })
  @IsString()
  @IsOptional()
  description?: string | null;
}
