export const createMockEventTypeRepository = () => ({
  getEventType: jest.fn(),
  getEventTypeList: jest.fn(),
  createEventType: jest.fn(),
  updateEventType: jest.fn(),
  deleteEventType: jest.fn(),
});
