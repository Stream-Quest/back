export const createMockSessionEventService = () => ({
  getSessionEventList: jest.fn(),
  getSessionEvent: jest.fn(),
  createSessionEvent: jest.fn(),
  updateSessionEvent: jest.fn(),
  validateSessionEvent: jest.fn(),
  rejectSessionEvent: jest.fn(),
  deleteSessionEvent: jest.fn(),
});
