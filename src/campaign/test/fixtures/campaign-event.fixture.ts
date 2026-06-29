import { CampaignEvent } from '../../../generated/prisma/client';
import { CampaignEventWithEvent } from '../../campaign-event.repository';
import { createMockEvent } from '../../../event/test/fixtures/event.fixture';

export const createMockCampaignEvent = (
  overrides: Partial<CampaignEvent> = {},
): CampaignEvent => ({
  id: 'campaign-event-123',
  isActive: true,
  campaignId: 'campaign-123',
  eventId: 'event-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockCampaignEventWithEvent = (
  overrides: Partial<CampaignEvent> = {},
): CampaignEventWithEvent => ({
  ...createMockCampaignEvent(overrides),
  event: {
    ...createMockEvent(),
    rules: [],
    resolutions: [],
  },
});
