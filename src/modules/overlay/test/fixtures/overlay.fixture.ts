import { SessionStreamer, User } from '../../../../generated/prisma/client';

export const createMockOverlaySessionStreamer = (
  overrides: Partial<SessionStreamer> = {},
): SessionStreamer => ({
  id: 'session-streamer-123',
  sessionId: 'session-123',
  userId: 'user-123',
  role: 'PLAYER' as const,
  playerCharacterId: null,
  canViewEvents: true,
  canViewKarma: true,
  canViewMilestones: true,
  canViewContext: true,
  canViewPlayers: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockOverlayUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  twitchId: '987654321',
  username: 'player1_',
  avatarUrl: null,
  twitchAccessToken: null,
  twitchRefreshToken: null,
  twitchTokenExpiresAt: null,
  overlayToken: 'overlay-token-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockSessionEvent = () => ({
  id: 'session-event-123',
  sessionId: 'session-123',
  eventId: 'event-123',
  triggeredAt: new Date('2024-01-01'),
});

export const createMockCampaignKarma = () => ({
  karmaValue: 10,
  chaosThreshold: -50,
  blessingThreshold: 50,
});

export const createMockContextSnapshot = () => ({
  id: 'context-snapshot-123',
  sessionId: 'session-123',
  snapshotAt: new Date('2024-01-01'),
  weather: { id: 'weather-123', name: 'Sunny' },
  location: { id: 'location-123', name: 'Tavern' },
});

export const createMockActivePlayer = () => ({
  id: 'session-player-character-123',
  sessionId: 'session-123',
  status: 'ACTIVE' as const,
  playerCharacter: { id: 'player-character-123', name: 'Aria' },
});

export const createMockMilestone = () => ({
  id: 'twitch-mapping-123',
  campaignId: 'campaign-123',
  isActive: true,
  showProgress: true,
  createdAt: new Date('2024-01-01'),
  event: { name: 'Boss defeated' },
});
