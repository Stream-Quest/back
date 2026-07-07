import { createMockEvent } from '../../../event/test/fixtures/event.fixture';
import {
  CampaignThresholdEvent,
  ThresholdType,
} from '../../../../generated/prisma/client';
import { ThresholdEventWithEvent } from '../../threshold-event.repository';

export const createMockThresholdEvent = (
  overrides: Partial<CampaignThresholdEvent> = {},
): CampaignThresholdEvent => ({
  id: 'threshold-event-123',
  thresholdType: ThresholdType.CHAOS,
  campaignId: 'campaign-123',
  eventId: 'event-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockThresholdEventWithEvent = (
  overrides: Partial<CampaignThresholdEvent> = {},
): ThresholdEventWithEvent => ({
  ...createMockThresholdEvent(overrides),
  event: createMockEvent(),
});
