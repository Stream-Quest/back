import { PlayerCharacter } from '../../../../generated/prisma/client';

export const createMockPlayerCharacter = (
  overrides: Partial<PlayerCharacter> = {},
): PlayerCharacter => ({
  id: 'player-character-123',
  name: 'Aragorn',
  class: 'Ranger',
  level: 8,
  maxHp: 55,
  armorClass: 16,
  avatarUrl: null,
  isAlive: true,
  displayAvatar: true,
  displayClass: true,
  displayLevel: true,
  displayHp: true,
  displayArmorClass: false,
  displayStatus: true,
  campaignId: 'campaign-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});
