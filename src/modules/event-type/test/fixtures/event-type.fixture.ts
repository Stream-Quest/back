import { EventType } from '../../../../generated/prisma/client';

export const createMockEventType = (
  overrides: Partial<EventType> = {},
): EventType => ({
  id: 'event-type-123',
  name: 'Wolf embuscade',
  description:
    'An embuscade of wolves triggered when TimeOfDay is NIGHT and Location is FOREST',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  createdById: 'user-123',
  ...overrides,
});
