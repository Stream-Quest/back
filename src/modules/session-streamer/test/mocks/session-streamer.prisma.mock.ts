import { createMockSessionStreamer } from '../fixtures/session-streamer.fixture';

export const createSessionStreamerPrismaMock = () => ({
  sessionStreamer: {
    findMany: jest.fn().mockResolvedValue([createMockSessionStreamer()]),
    findUnique: jest.fn().mockResolvedValue(createMockSessionStreamer()),
    create: jest.fn().mockResolvedValue(createMockSessionStreamer()),
    update: jest.fn().mockResolvedValue(createMockSessionStreamer()),
    delete: jest.fn().mockResolvedValue(createMockSessionStreamer()),
  },
  session: {
    findUnique: jest.fn().mockResolvedValue({
      id: 'session-123',
      title: 'Session #12',
      campaign: {
        title: 'The Lost Chronicles',
        gameMaster: { username: 'maengdok_' },
      },
    }),
  },
  user: {
    findUniqueOrThrow: jest
      .fn()
      .mockResolvedValue({ overlayToken: 'overlay-token-123' }),
  },
});
