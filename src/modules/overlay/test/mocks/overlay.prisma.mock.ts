import {
  createMockActivePlayer,
  createMockContextSnapshot,
  createMockMilestone,
  createMockOverlaySessionStreamer,
  createMockOverlayUser,
  createMockSessionEvent,
} from '../fixtures/overlay.fixture';

export const createOverlayPrismaMock = () => ({
  sessionEvent: {
    findMany: jest.fn().mockResolvedValue([createMockSessionEvent()]),
  },
  session: {
    findUnique: jest.fn().mockResolvedValue({
      campaign: {
        karmaValue: 10,
        chaosThreshold: -50,
        blessingThreshold: 50,
      },
      campaignId: 'campaign-123',
    }),
  },
  contextSnapshot: {
    findFirst: jest.fn().mockResolvedValue(createMockContextSnapshot()),
  },
  sessionPlayerCharacter: {
    findMany: jest.fn().mockResolvedValue([createMockActivePlayer()]),
  },
  twitchEventMapping: {
    findMany: jest.fn().mockResolvedValue([createMockMilestone()]),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(createMockOverlayUser()),
  },
  sessionStreamer: {
    findUnique: jest.fn().mockResolvedValue(createMockOverlaySessionStreamer()),
  },
});
