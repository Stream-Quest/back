import { Test, TestingModule } from '@nestjs/testing';
import { LocationRepository } from '../location.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockLocation } from './fixtures/location.fixture';
import { createMockPrismaService } from './mocks/location.prisma.mock';

describe('LocationRepository', () => {
  let repository: LocationRepository;
  let prismaService: PrismaService;

  const mockLocation = createMockLocation();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(LocationRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getLocation', () => {
    it('should return a location when found', async () => {
      jest
        .spyOn(prismaService.location, 'findUnique')
        .mockResolvedValue(mockLocation);

      const result = await repository.getLocation({ id: 'location-123' });

      expect(result).toEqual(mockLocation);
      expect(prismaService.location.findUnique).toHaveBeenCalledWith({
        where: { id: 'location-123' },
      });
    });

    it('should return null when location not found', async () => {
      jest.spyOn(prismaService.location, 'findUnique').mockResolvedValue(null);

      const result = await repository.getLocation({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('getLocationList', () => {
    const mockLocations = [
      createMockLocation({ id: 'location-1', name: 'SUNNY' }),
      createMockLocation({ id: 'location-2', name: 'RAINY' }),
    ];

    it('should return locations in forward direction', async () => {
      jest
        .spyOn(prismaService.location, 'findMany')
        .mockResolvedValue(mockLocations);

      const result = await repository.getLocationList({
        take: 10,
        direction: 'forward',
      });

      expect(result).toEqual(mockLocations);
      expect(prismaService.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return locations in backward direction (reversed)', async () => {
      jest
        .spyOn(prismaService.location, 'findMany')
        .mockResolvedValue([...mockLocations]);

      const result = await repository.getLocationList({
        take: 10,
        direction: 'backward',
        cursor: 'cursor-123',
      });

      expect(result).toEqual([...mockLocations].reverse());
      expect(prismaService.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: -10,
          skip: 1,
          cursor: { id: 'cursor-123' },
        }),
      );
    });

    it('should use default take value of 10', async () => {
      jest
        .spyOn(prismaService.location, 'findMany')
        .mockResolvedValue(mockLocations);

      await repository.getLocationList();

      expect(prismaService.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('createLocation', () => {
    it('should create and return a location with name uppercased', async () => {
      jest
        .spyOn(prismaService.location, 'create')
        .mockResolvedValue(mockLocation);

      const dto = {
        name: 'forest',
        displayName: 'Forest',
        description: 'A simple forest',
        imageUrl: 'https://example.com/forest.png',
      };

      const result = await repository.createLocation(dto);

      expect(result).toEqual(mockLocation);
      expect(prismaService.location.create).toHaveBeenCalledWith({
        data: {
          name: 'FOREST',
          displayName: 'Forest',
          description: 'A simple forest',
          imageUrl: 'https://example.com/forest.png',
        },
      });
    });

    it('should uppercase the name regardless of input casing', async () => {
      jest
        .spyOn(prismaService.location, 'create')
        .mockResolvedValue(mockLocation);

      await repository.createLocation({
        name: 'Sea',
        displayName: 'Sea',
      });

      expect(prismaService.location.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'SEA' }),
        }),
      );
    });
  });

  describe('updateLocation', () => {
    it('should update and return a location', async () => {
      const updatedLocation = createMockLocation({ displayName: 'Sea' });
      jest
        .spyOn(prismaService.location, 'update')
        .mockResolvedValue(updatedLocation);

      const result = await repository.updateLocation(
        { id: 'location-123' },
        { displayName: 'Sea' },
      );

      expect(result).toEqual(updatedLocation);
      expect(prismaService.location.update).toHaveBeenCalledWith({
        where: { id: 'location-123' },
        data: { displayName: 'Sea' },
      });
    });
  });

  describe('deleteLocation', () => {
    it('should delete and return a location', async () => {
      jest
        .spyOn(prismaService.location, 'delete')
        .mockResolvedValue(mockLocation);

      const result = await repository.deleteLocation({ id: 'location-123' });

      expect(result).toEqual(mockLocation);
      expect(prismaService.location.delete).toHaveBeenCalledWith({
        where: { id: 'location-123' },
      });
    });
  });
});
