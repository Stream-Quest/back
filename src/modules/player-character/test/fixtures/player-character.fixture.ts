import { PlayerCharacter } from '../../../../generated/prisma/client';

export const createMockPlayerCharacter = (
  overrides: Partial<PlayerCharacter> = {},
): PlayerCharacter => ({
  id: 'player-character-123',
  name: 'Magendok',
  class: 'Fiend Warlock',
  level: 4,
  avatarUrl: 'https://random.url/random-image',
  isAlive: true,
  displayAvatar: true,
  displayClass: true,
  displayLevel: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  campaignId: 'campaign-123',
  ...overrides,
});
