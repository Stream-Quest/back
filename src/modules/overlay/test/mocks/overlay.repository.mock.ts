import {
  createMockActivePlayer,
  createMockCampaignKarma,
  createMockContextSnapshot,
  createMockMilestone,
  createMockSessionEvent,
} from '../fixtures/overlay.fixture';

export const createMockOverlayRepository = () => ({
  getEvents: jest.fn().mockResolvedValue([createMockSessionEvent()]),
  getSessionCampaignKarma: jest
    .fn()
    .mockResolvedValue(createMockCampaignKarma()),
  getLatestContextSnapshot: jest
    .fn()
    .mockResolvedValue(createMockContextSnapshot()),
  getActivePlayers: jest.fn().mockResolvedValue([createMockActivePlayer()]),
  getSessionCampaignId: jest.fn().mockResolvedValue('campaign-123'),
  getMilestones: jest.fn().mockResolvedValue([createMockMilestone()]),
});
