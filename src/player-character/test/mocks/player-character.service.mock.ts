export const createMockPlayerCharacterService = () => ({
  getPlayerCharacterList: jest.fn(),
  getPlayerCharacter: jest.fn(),
  createPlayerCharacter: jest.fn(),
  updatePlayerCharacter: jest.fn(),
  deletePlayerCharacter: jest.fn(),
});
