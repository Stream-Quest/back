export const createMockSessionPlayerCharacterRepository = () => ({
  getSessionPlayerCharacterList: jest.fn(),
  getSessionPlayerCharacter: jest.fn(),
  getPlayerCharacterWithMaxHp: jest.fn(),
  createSessionPlayerCharacter: jest.fn(),
  updateSessionPlayerCharacter: jest.fn(),
  removeSessionPlayerCharacter: jest.fn(),
});
