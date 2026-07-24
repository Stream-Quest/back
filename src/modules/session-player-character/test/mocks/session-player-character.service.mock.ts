export const createMockSessionPlayerCharacterService = () => ({
  getSessionPlayerCharacterList: jest.fn(),
  createSessionPlayerCharacter: jest.fn(),
  updateSessionPlayerCharacter: jest.fn(),
  removeSessionPlayerCharacter: jest.fn(),
});
