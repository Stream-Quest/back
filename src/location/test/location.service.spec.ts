import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LocationService } from '../location.service';
import { LocationRepository } from '../location.repository';
import { createMockLocation } from './fixtures/location.fixture';
import { createMockLocationRepository } from './mocks/location.repository.mock';

describe('LocationService', () => {
  let service: LocationService;
  let repository: LocationRepository;

  const mockLocation = createMockLocation();
  const mockRepository = createMockLocationRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: LocationRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(LocationService);
    repository = module.get(LocationRepository);

    jest.clearAllMocks();
  });

  describe('getLocationList', () => {
    it('should return paginated location list', async () => {
      const mockLocations = [
        createMockLocation({ id: 'location-1' }),
        createMockLocation({ id: 'location-2' }),
      ];
      jest
        .spyOn(repository, 'getLocationList')
        .mockResolvedValue(mockLocations);

      const result = await service.getLocationList({ limit: 10 });

      expect(result.data).toEqual(mockLocations);
      expect(result.count).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(repository.getLocationList).toHaveBeenCalledWith(
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const mockLocations = Array.from({ length: 11 }, (_, i) =>
        createMockLocation({ id: `location-${i}` }),
      );
      jest
        .spyOn(repository, 'getLocationList')
        .mockResolvedValue(mockLocations);

      const result = await service.getLocationList({ limit: 10 });

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('location-9');
    });

    it('should set hasPrevious when cursor is present', async () => {
      jest
        .spyOn(repository, 'getLocationList')
        .mockResolvedValue([mockLocation]);

      const result = await service.getLocationList({
        cursor: 'some-cursor',
        limit: 10,
      });

      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('getLocation', () => {
    it('should return a location when found', async () => {
      jest.spyOn(repository, 'getLocation').mockResolvedValue(mockLocation);

      const result = await service.getLocation('location-123');

      expect(result).toEqual(mockLocation);
      expect(repository.getLocation).toHaveBeenCalledWith({
        id: 'location-123',
      });
    });

    it('should throw NotFoundException when location not found', async () => {
      jest.spyOn(repository, 'getLocation').mockResolvedValue(null);

      await expect(service.getLocation('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getLocation('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createLocation', () => {
    it('should create and return a location', async () => {
      jest.spyOn(repository, 'createLocation').mockResolvedValue(mockLocation);

      const dto = {
        name: 'FOREST',
        displayName: 'Forest',
        description: 'A simple forest',
        imageUrl: 'https://example.com/forest.png',
      };

      const result = await service.createLocation(dto);

      expect(result).toEqual(mockLocation);
      expect(repository.createLocation).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateLocation', () => {
    it('should update and return a location', async () => {
      const updatedLocation = createMockLocation({ displayName: 'Sea' });
      jest
        .spyOn(repository, 'updateLocation')
        .mockResolvedValue(updatedLocation);

      const dto = { displayName: 'Sea' };
      const result = await service.updateLocation(dto, mockLocation);

      expect(result).toEqual(updatedLocation);
      expect(repository.updateLocation).toHaveBeenCalledWith(
        { id: 'location-123' },
        dto,
      );
    });
  });

  describe('deleteLocation', () => {
    it('should delete and return a location', async () => {
      jest.spyOn(repository, 'deleteLocation').mockResolvedValue(mockLocation);

      const result = await service.deleteLocation(mockLocation);

      expect(result).toEqual(mockLocation);
      expect(repository.deleteLocation).toHaveBeenCalledWith({
        id: 'location-123',
      });
    });
  });
});
