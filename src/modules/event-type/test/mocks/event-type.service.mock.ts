export const createMockEventTypeService = () => ({
  getEventTypeList: jest.fn(),
  getEventType: jest.fn(),
  createEventType: jest.fn(),
  updateEventType: jest.fn(),
  deleteEventType: jest.fn(),
});
