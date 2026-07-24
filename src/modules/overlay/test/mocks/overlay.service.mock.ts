export const createMockOverlayService = () => ({
  getEvents: jest.fn(),
  getKarma: jest.fn(),
  getContext: jest.fn(),
  getPlayers: jest.fn(),
  getMilestones: jest.fn(),
});
