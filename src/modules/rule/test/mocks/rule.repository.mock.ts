export const createMockRuleRepository = () => ({
  getRule: jest.fn(),
  createRule: jest.fn(),
  updateRule: jest.fn(),
  deleteRule: jest.fn(),
});
