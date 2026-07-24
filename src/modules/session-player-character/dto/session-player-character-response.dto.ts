import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CharacterStatus, PlayerStatus } from '../../../generated/prisma/enums';

export class SessionPlayerCharacterResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'SessionPlayerCharacter unique identifier',
  })
  id: string;

  @ApiProperty({
    example: '2026-07-09T10:00:00.000Z',
    description: 'When the player joined the session',
  })
  joinedAt: Date;

  @ApiPropertyOptional({
    example: '2026-07-09T12:00:00.000Z',
    description: 'When the player left the session',
  })
  leftAt: Date | null;

  @ApiProperty({
    enum: PlayerStatus,
    example: PlayerStatus.ACTIVE,
    description: 'Player participation status',
  })
  status: PlayerStatus;

  @ApiPropertyOptional({
    example: 45,
    description: 'Current HP of the character during this session',
  })
  currentHp: number | null;

  @ApiProperty({
    enum: CharacterStatus,
    example: CharacterStatus.OK,
    description: 'Current character status (health/buff/debuff)',
  })
  charStatus: CharacterStatus;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session UUID (foreign key)',
  })
  sessionId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'PlayerCharacter UUID (foreign key)',
  })
  playerCharacterId: string;
}

export class DetailedSessionPlayerCharacterResponseDto extends SessionPlayerCharacterResponseDto {
  @ApiProperty({
    description: 'Full player character details',
    example: {
      id: '...',
      name: 'Aragorn',
      class: 'Ranger',
      level: 8,
      maxHp: 55,
    },
  })
  playerCharacter: {
    id: string;
    name: string;
    class: string | null;
    level: number | null;
    maxHp: number | null;
    armorClass: number | null;
    avatarUrl: string | null;
    isAlive: boolean;
    displayAvatar: boolean;
    displayClass: boolean;
    displayLevel: boolean;
    displayHp: boolean;
    displayArmorClass: boolean;
    displayStatus: boolean;
  };
}
