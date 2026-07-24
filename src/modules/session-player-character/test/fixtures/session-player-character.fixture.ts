import {
  CharacterStatus,
  PlayerStatus,
  SessionPlayerCharacter,
} from '../../../../generated/prisma/client';
import { SessionPlayerCharacterWithDetails } from '../../session-player-character.repository';
import { createMockPlayerCharacter } from '../../../player-character/test/fixtures/player-character.fixture';

export const createMockSessionPlayerCharacter = (
  overrides: Partial<SessionPlayerCharacter> = {},
): SessionPlayerCharacter => ({
  id: 'session-player-character-123',
  joinedAt: new Date('2024-01-01T10:00:00.000Z'),
  leftAt: null,
  status: PlayerStatus.ACTIVE,
  currentHp: 45,
  charStatus: CharacterStatus.OK,
  sessionId: 'session-123',
  playerCharacterId: 'player-character-123',
  ...overrides,
});

export const createMockSessionPlayerCharacterWithDetails = (
  overrides: Partial<SessionPlayerCharacter> = {},
): SessionPlayerCharacterWithDetails => {
  const playerCharacter = createMockPlayerCharacter();
  return {
    ...createMockSessionPlayerCharacter(overrides),
    playerCharacter: {
      id: playerCharacter.id,
      name: playerCharacter.name,
      class: playerCharacter.class,
      level: playerCharacter.level,
      maxHp: playerCharacter.maxHp,
      armorClass: playerCharacter.armorClass,
      avatarUrl: playerCharacter.avatarUrl,
      isAlive: playerCharacter.isAlive,
      displayAvatar: playerCharacter.displayAvatar,
      displayClass: playerCharacter.displayClass,
      displayLevel: playerCharacter.displayLevel,
      displayHp: playerCharacter.displayHp,
      displayArmorClass: playerCharacter.displayArmorClass,
      displayStatus: playerCharacter.displayStatus,
    },
  };
};
