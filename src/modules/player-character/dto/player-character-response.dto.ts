import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlayerCharacterResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Player character unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Magendok',
    description: "Player character's name",
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Fiend Warlock',
    description: "Player character's class",
  })
  class?: string | null;

  @ApiPropertyOptional({
    example: 4,
    default: 1,
    description: "Player character's level",
  })
  level?: number | null;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: "Player character's health points",
  })
  maxHp?: number | null;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: "Player character's armor class",
  })
  armorClass?: number | null;

  @ApiPropertyOptional({
    example: 'https://random.url/random-image',
    description: "Player character's avatar",
  })
  avatarUrl?: string | null;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Is the player character alive ?',
  })
  isAlive: boolean;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Is the avatar displayable ?',
  })
  displayAvatar: boolean;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Is the class displayable ?',
  })
  displayClass: boolean;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Is the level displayable ?',
  })
  displayLevel: boolean;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Are the health points displayable ?',
  })
  displayHp: boolean;

  @ApiProperty({
    example: true,
    default: false,
    description: 'Is the armor class displayable ?',
  })
  displayArmorClass: boolean;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Is the status displayable ?',
  })
  displayStatus: boolean;

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

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Campaign UUID (foreign key)',
  })
  campaignId: string;
}
