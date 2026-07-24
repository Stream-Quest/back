export const createMockPrismaService = () => {
  const mock = {
    session: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contextSnapshot: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    campaign: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    sessionStreamer: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  mock.$transaction.mockImplementation(
    (callback: (tx: typeof mock) => unknown) => callback(mock),
  );

  return mock;
};
