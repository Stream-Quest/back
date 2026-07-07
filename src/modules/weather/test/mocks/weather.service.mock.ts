export const createMockWeatherService = () => ({
  getWeatherList: jest.fn(),
  getWeather: jest.fn(),
  createWeather: jest.fn(),
  updateWeather: jest.fn(),
  deleteWeather: jest.fn(),
});
