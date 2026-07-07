import {
  createMockThresholdEvent,
  createMockThresholdEventWithEvent,
} from '../fixtures/threshold-event.fixture';

export const createMockThresholdEventRepository = () => ({
  getThresholdEventList: jest
    .fn()
    .mockResolvedValue([createMockThresholdEvent()]),
  getThresholdEvent: jest
    .fn()
    .mockResolvedValue(createMockThresholdEventWithEvent()),
  getThresholdEventsByType: jest
    .fn()
    .mockResolvedValue([createMockThresholdEventWithEvent()]),
  createThresholdEvent: jest.fn().mockResolvedValue(createMockThresholdEvent()),
  updateThresholdEvent: jest.fn().mockResolvedValue(createMockThresholdEvent()),
  deleteThresholdEvent: jest.fn().mockResolvedValue(createMockThresholdEvent()),
});
