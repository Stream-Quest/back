import { SessionStreamer } from '../../../../generated/prisma/client';
import { SessionStreamerWithUser } from '../../session-streamer.repository';

export const createMockSessionStreamer = (
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

export const createMockSessionStreamerWithUser = (
  overrides: Partial<SessionStreamer> = {},
): SessionStreamerWithUser => ({
  ...createMockSessionStreamer(overrides),
  user: {
    id: 'user-123',
    username: 'player1_',
    avatarUrl: null,
    twitchId: '987654321',
  },
});

export const createMockSessionWithCampaign = () => ({
  id: 'session-123',
  title: 'Session #12',
  description: null,
  status: 'LIVE' as const,
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  campaignId: 'campaign-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  campaign: {
    title: 'The Lost Chronicles',
    gameMaster: { username: 'maengdok_' },
  },
});
