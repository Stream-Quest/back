export const createMockLocationRepository = () => ({
  getLocationList: jest.fn(),
  getLocation: jest.fn(),
  createLocation: jest.fn(),
  updateLocation: jest.fn(),
  deleteLocation: jest.fn(),
});
