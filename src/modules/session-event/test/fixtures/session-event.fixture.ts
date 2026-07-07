import {
  SessionEvent,
  SessionEventStatus,
} from '../../../../generated/prisma/client';
import { SessionEventWithDetails } from '../../session-event.repository';
import { createMockEventWithDetails } from '../../../event/test/fixtures/event.fixture';

export const createMockSessionEvent = (
  overrides: Partial<SessionEvent> = {},
): SessionEvent => ({
  id: 'session-event-123',
  status: SessionEventStatus.PENDING,
  finalMessage: null,
  triggeredAt: new Date('2024-01-01T10:00:00.000Z'),
  resolvedAt: null,
  sessionId: 'session-123',
  eventId: 'event-123',
  chosenResolutionId: null,
  thresholdEventId: null, // ← ajouter
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockSessionEventResolution = (overrides = {}) => ({
  id: 'session-event-resolution-123',
  sessionEventId: 'session-event-123',
  resolutionId: 'resolution-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockSessionEventWithDetails = (
  overrides: Partial<SessionEvent> = {},
): SessionEventWithDetails => ({
  ...createMockSessionEvent(overrides),
  event: createMockEventWithDetails(),
  chosenResolution: null,
  sessionEventResolutions: [createMockSessionEventResolution()],
});
