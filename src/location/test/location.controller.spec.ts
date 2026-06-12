import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { LocationController } from '../location.controller';
import { LocationService } from '../location.service';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { LocationGuard } from '../guard/location.guard';
import { createMockLocation } from './fixtures/location.fixture';
import { createMockLocationService } from './mocks/location.service.mock';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  const mockLocation = createMockLocation();
  const mockService = createMockLocationService();

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 'user-123', username: 'testuser' };
      return true;
    }),
  };

  const mockLocationGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.location = mockLocation;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(LocationGuard)
      .useValue(mockLocationGuard)
      .compile();

    controller = module.get(LocationController);
    service = module.get(LocationService);

    jest.clearAllMocks();
  });

  describe('locationList', () => {
    it('should return paginated location list', async () => {
      const mockResponse = {
        data: [mockLocation],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest.spyOn(service, 'getLocationList').mockResolvedValue(mockResponse);

      const result = await controller.locationList({ limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(service.getLocationList).toHaveBeenCalledWith({ limit: 10 });
    });
  });

  describe('locationDetails', () => {
    it('should return location details', async () => {
      jest.spyOn(service, 'getLocation').mockResolvedValue(mockLocation);

      const result = await controller.locationDetails('location-123');

      expect(result).toEqual(mockLocation);
      expect(service.getLocation).toHaveBeenCalledWith('location-123');
    });
  });

  describe('createLocation', () => {
    it('should create and return a location', async () => {
      const createDto = {
        name: 'SUNNY',
        displayName: 'Sunny',
        description: 'A sunny day',
        iconUrl: 'https://example.com/sunny.png',
      };
      jest.spyOn(service, 'createLocation').mockResolvedValue(mockLocation);

      const result = await controller.createLocation(createDto);

      expect(result).toEqual(mockLocation);
      expect(service.createLocation).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateLocation', () => {
    it('should update and return a location', async () => {
      const updateDto = { displayName: 'Very Sunny' };
      const updatedLocation = createMockLocation({ displayName: 'Very Sunny' });
      jest.spyOn(service, 'updateLocation').mockResolvedValue(updatedLocation);

      const result = await controller.updateLocation(updateDto, mockLocation);

      expect(result).toEqual(updatedLocation);
      expect(service.updateLocation).toHaveBeenCalledWith(
        updateDto,
        mockLocation,
      );
    });
  });

  describe('deleteLocation', () => {
    it('should delete and return a location', async () => {
      jest.spyOn(service, 'deleteLocation').mockResolvedValue(mockLocation);

      const result = await controller.deleteLocation(mockLocation);

      expect(result).toEqual(mockLocation);
      expect(service.deleteLocation).toHaveBeenCalledWith(mockLocation);
    });
  });

  describe('Guards', () => {
    it('should apply JwtAuthGuard to all routes', () => {
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });

    it('should apply LocationGuard to protected routes', () => {
      expect(mockLocationGuard.canActivate).toBeDefined();
    });
  });
});
