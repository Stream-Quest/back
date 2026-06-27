import {
  Event,
  Rule,
  Resolution,
  ConditionGroup,
  Condition,
} from '../../../generated/prisma/client';
import {
  TriggerType,
  Operator,
  ContextType,
} from '../../../generated/prisma/enums';
import { EventWithCount, EventWithDetails } from '../../event.repository';
import { ResolutionWithConditions } from '../../resolution.repository';

export const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'event-123',
  name: 'Wolf ambush',
  karmaValue: -10,
  isTemplate: false,
  isPublic: false,
  eventTypeId: 'event-type-123',
  gameMasterId: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockRule = (overrides: Partial<Rule> = {}): Rule => ({
  id: 'rule-123',
  triggerType: TriggerType.CHAT_COMMAND,
  config: { command: '!wolf', cooldownPerUser: 60 },
  cooldown: 300,
  isActive: true,
  eventId: 'event-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockCondition = (
  overrides: Partial<Condition> = {},
): Condition => ({
  id: 'condition-123',
  contextType: ContextType.TIME_OF_DAY,
  value: 'NIGHT',
  conditionGroupId: 'condition-group-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockConditionGroup = (
  overrides: Partial<ConditionGroup> = {},
): ConditionGroup => ({
  id: 'condition-group-123',
  operator: Operator.AND,
  resolutionId: 'resolution-123',
  parentGroupId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockResolution = (
  overrides: Partial<Resolution> = {},
): Resolution => ({
  id: 'resolution-123',
  message: 'The wolves emerge from the shadows...',
  isFallback: false,
  eventId: 'event-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockResolutionWithConditions = (
  overrides: Partial<Resolution> = {},
): ResolutionWithConditions => ({
  ...createMockResolution(overrides),
  conditionGroups: [
    {
      ...createMockConditionGroup(),
      conditions: [createMockCondition()],
    },
  ],
});

export const createMockEventWithCount = (
  overrides: Partial<Event> = {},
): EventWithCount => ({
  ...createMockEvent(overrides),
  _count: { rules: 1, resolutions: 1 },
});

export const createMockEventWithDetails = (
  overrides: Partial<Event> = {},
): EventWithDetails => ({
  ...createMockEvent(overrides),
  rules: [createMockRule()],
  resolutions: [
    {
      ...createMockResolution(),
      conditionGroups: [
        {
          ...createMockConditionGroup(),
          conditions: [createMockCondition()],
        },
      ],
    },
  ],
});
