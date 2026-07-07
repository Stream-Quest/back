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

export class CreatePlayerCharacterDto {
  @ApiProperty({
    example: 'Magendok',
    description: "Player character's name",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Fiend Warlock',
    description: "Player character's class",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  class?: string | null;

  @ApiPropertyOptional({
    example: 4,
    description: "Player character's level",
  })
  @IsInt()
  @IsOptional()
  level?: number | null;

  @ApiPropertyOptional({
    example: 'https://random.url/random-image',
    description: "Player character's avatar",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Is the player character alive ?',
  })
  @IsBoolean()
  @IsOptional()
  isAlive: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Is the avatar displayable ?',
  })
  @IsBoolean()
  @IsOptional()
  displayAvatar: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Is the class displayable ?',
  })
  @IsBoolean()
  @IsOptional()
  displayClass: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Is the level displayable ?',
  })
  @IsBoolean()
  @IsOptional()
  displayLevel: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Campaign UUID (foreign key)',
  })
  @IsUUID()
  @IsNotEmpty()
  campaignId: string;
}
