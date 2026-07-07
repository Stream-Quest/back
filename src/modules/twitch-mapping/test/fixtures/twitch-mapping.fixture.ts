import { createMockEvent } from '../../../event/test/fixtures/event.fixture';
import {
  TriggerType,
  TwitchEventMapping,
} from '../../../../generated/prisma/client';
import { TwitchMappingWithEvent } from '../../twitch-mapping.repository';

export const createMockTwitchMapping = (
  overrides: Partial<TwitchEventMapping> = {},
): TwitchEventMapping => ({
  id: 'twitch-mapping-123',
  twitchEventType: TriggerType.SUB_TIER1,
  isActive: true,
  campaignId: 'campaign-123',
  eventId: 'event-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockTwitchMappingWithEvent = (
  overrides: Partial<TwitchEventMapping> = {},
): TwitchMappingWithEvent => ({
  ...createMockTwitchMapping(overrides),
  event: createMockEvent(),
});
