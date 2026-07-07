import { Location } from '../../../../generated/prisma/client';

export const createMockLocation = (
  overrides: Partial<Location> = {},
): Location => ({
  id: 'location-123',
  name: 'FOREST',
  displayName: 'Forest',
  description: 'A simple forest',
  imageUrl: 'https://example.com/forest.png',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});
