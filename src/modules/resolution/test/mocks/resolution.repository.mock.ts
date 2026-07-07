export const createMockResolutionRepository = () => ({
  getResolution: jest.fn(),
  createResolution: jest.fn(),
  updateResolution: jest.fn(),
  deleteResolution: jest.fn(),
});
