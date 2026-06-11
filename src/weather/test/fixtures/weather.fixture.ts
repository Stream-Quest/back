import { Weather } from '../../../generated/prisma/client';

export const createMockWeather = (
  overrides: Partial<Weather> = {},
): Weather => ({
  id: 'weather-123',
  name: 'SUNNY',
  displayName: 'Sunny',
  description: 'A sunny day',
  iconUrl: 'https://example.com/sunny.png',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});
