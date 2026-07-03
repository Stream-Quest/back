import { createMockKarmaEvent } from '../fixtures/karma-event.fixture';

export const createMockKarmaEventRepository = () => ({
  getKarmaEventList: jest.fn().mockResolvedValue([createMockKarmaEvent()]),
  getKarmaEvent: jest.fn().mockResolvedValue(createMockKarmaEvent()),
  createKarmaEvent: jest.fn().mockResolvedValue(createMockKarmaEvent()),
  incrementCampaignKarma: jest.fn().mockResolvedValue({
    karmaValue: -10,
    chaosThreshold: -50,
    blessingThreshold: 50,
  }),
});
