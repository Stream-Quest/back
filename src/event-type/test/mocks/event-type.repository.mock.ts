export const createMockEventTypeRepository = () => ({
  getEventTypeList: jest.fn(),
  getEventType: jest.fn(),
  createEventType: jest.fn(),
  updateEventType: jest.fn(),
  deleteEventType: jest.fn(),
});
