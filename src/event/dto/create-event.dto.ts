import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'Wolf ambush',
    description: 'Event name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: -10,
    description: 'Karma value applied when this event is triggered',
  })
  @IsInt()
  @IsOptional()
  karmaValue?: number = 0;

  @ApiPropertyOptional({
    example: false,
    description: 'Is this event a template ?',
  })
  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean = false;

  @ApiPropertyOptional({
    example: false,
    description: 'Is this event public ?',
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event Type UUID (foreign key)',
  })
  @IsUUID()
  @IsNotEmpty()
  eventTypeId: string;
}
