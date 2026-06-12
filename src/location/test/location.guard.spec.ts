import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LocationGuard } from '../guard/location.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockLocation } from './fixtures/location.fixture';

const createMockPrismaService = () => ({
  location: {
    findUnique: jest.fn(),
  },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    locationId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: { id: overrides.locationId ?? 'location-123' },
    location: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('LocationGuard', () => {
  let guard: LocationGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockLocation = createMockLocation();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get(LocationGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when location exists and user is authenticated', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        locationId: 'location-123',
      });

      jest
        .spyOn(prismaService.location, 'findUnique')
        .mockResolvedValue(mockLocation);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach location to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        locationId: 'location-123',
      });
      const request = context.switchToHttp().getRequest();

      jest
        .spyOn(prismaService.location, 'findUnique')
        .mockResolvedValue(mockLocation);

      await guard.canActivate(context);

      expect(request.location).toEqual(mockLocation);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        locationId: 'location-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when location id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        locationId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Location id not provided',
      );
    });

    it('should throw NotFoundException when location is not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        locationId: 'not-found',
      });

      jest.spyOn(prismaService.location, 'findUnique').mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Location not found',
      );
    });

    it('should query location with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        locationId: 'location-123',
      });

      jest
        .spyOn(prismaService.location, 'findUnique')
        .mockResolvedValue(mockLocation);

      await guard.canActivate(context);

      expect(prismaService.location.findUnique).toHaveBeenCalledWith({
        where: { id: 'location-123' },
      });
    });
  });
});
