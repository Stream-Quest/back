export const createMockSessionPlayerCharacterPrismaService = () => ({
  sessionPlayerCharacter: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  playerCharacter: {
    findUnique: jest.fn(),
  },
});
