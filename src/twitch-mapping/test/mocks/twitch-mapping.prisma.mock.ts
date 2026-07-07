import { createMockTwitchMapping } from '../fixtures/twitch-mapping.fixture';

export const createTwitchMappingPrismaMock = () => ({
  twitchEventMapping: {
    findMany: jest.fn().mockResolvedValue([createMockTwitchMapping()]),
    findUnique: jest.fn().mockResolvedValue(createMockTwitchMapping()),
    create: jest.fn().mockResolvedValue(createMockTwitchMapping()),
    update: jest.fn().mockResolvedValue(createMockTwitchMapping()),
    delete: jest.fn().mockResolvedValue(createMockTwitchMapping()),
  },
  user: {
    findUnique: jest
      .fn()
      .mockResolvedValue({ id: 'user-123', twitchId: '123456789' }),
  },
  session: {
    findFirst: jest
      .fn()
      .mockResolvedValue({ id: 'session-123', campaignId: 'campaign-123' }),
  },
  sessionStreamer: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  sessionEvent: {
    create: jest.fn().mockResolvedValue({
      id: 'session-event-123',
      eventId: 'event-123',
      triggeredAt: new Date('2024-01-01'),
    }),
  },
});
