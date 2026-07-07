import {
  createMockTwitchMapping,
  createMockTwitchMappingWithEvent,
} from '../fixtures/twitch-mapping.fixture';

export const createMockTwitchMappingRepository = () => ({
  getTwitchMappingList: jest
    .fn()
    .mockResolvedValue([createMockTwitchMapping()]),
  getTwitchMapping: jest
    .fn()
    .mockResolvedValue(createMockTwitchMappingWithEvent()),
  getActiveMappingsByType: jest
    .fn()
    .mockResolvedValue([createMockTwitchMappingWithEvent()]),
  createTwitchMapping: jest.fn().mockResolvedValue(createMockTwitchMapping()),
  updateTwitchMapping: jest.fn().mockResolvedValue(createMockTwitchMapping()),
  deleteTwitchMapping: jest.fn().mockResolvedValue(createMockTwitchMapping()),
});
