import { createMockKarmaEvent } from '../fixtures/karma-event.fixture';
import { createMockThresholdEvent } from '../fixtures/threshold-event.fixture';

export const createKarmaEventPrismaMock = () => ({
  karmaEvent: {
    findMany: jest.fn().mockResolvedValue([createMockKarmaEvent()]),
    findUnique: jest.fn().mockResolvedValue(createMockKarmaEvent()),
    create: jest.fn().mockResolvedValue(createMockKarmaEvent()),
  },
  campaignThresholdEvent: {
    findMany: jest.fn().mockResolvedValue([createMockThresholdEvent()]),
    findUnique: jest.fn().mockResolvedValue(createMockThresholdEvent()),
    create: jest.fn().mockResolvedValue(createMockThresholdEvent()),
    update: jest.fn().mockResolvedValue(createMockThresholdEvent()),
    delete: jest.fn().mockResolvedValue(createMockThresholdEvent()),
  },
  campaign: {
    update: jest.fn().mockResolvedValue({
      karmaValue: -10,
      chaosThreshold: -50,
      blessingThreshold: 50,
    }),
  },
  sessionEvent: {
    create: jest.fn().mockResolvedValue({
      id: 'session-event-123',
      eventId: 'event-123',
      triggeredAt: new Date('2024-01-01'),
    }),
  },
});
