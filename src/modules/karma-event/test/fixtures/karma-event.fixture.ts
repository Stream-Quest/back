import { KarmaEvent } from '../../../../generated/prisma/client';

export const createMockKarmaEvent = (
  overrides: Partial<KarmaEvent> = {},
): KarmaEvent => ({
  id: 'karma-event-123',
  value: -10,
  reason: 'Wolf Ambush',
  occurredAt: new Date('2024-01-01'),
  campaignId: 'campaign-123',
  sessionId: null,
  ...overrides,
});
