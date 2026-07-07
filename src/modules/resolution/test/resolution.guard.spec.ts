import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResolutionGuard } from '../guard/resolution.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockResolution } from '../../event/test/fixtures/event.fixture';

const createMockPrismaService = () => ({
  resolution: { findUnique: jest.fn() },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    eventId?: string;
    resolutionId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: {
      id: overrides.eventId ?? 'event-123',
      resolutionId: overrides.resolutionId ?? 'resolution-123',
    },
    resolution: undefined,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

describe('ResolutionGuard', () => {
  let guard: ResolutionGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockResolution = createMockResolution();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolutionGuard,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    guard = module.get(ResolutionGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when resolution exists and belongs to event', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'event-123',
        resolutionId: 'resolution-123',
      });
      jest
        .spyOn(prismaService.resolution, 'findUnique')
        .mockResolvedValue(mockResolution);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach resolution to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'event-123',
        resolutionId: 'resolution-123',
      });
      const request = context.switchToHttp().getRequest();
      jest
        .spyOn(prismaService.resolution, 'findUnique')
        .mockResolvedValue(mockResolution);

      await guard.canActivate(context);

      expect(request.resolution).toEqual(mockResolution);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        resolutionId: 'resolution-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when resolution id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        resolutionId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Resolution id not provided',
      );
    });

    it('should throw NotFoundException when resolution not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        resolutionId: 'not-found',
      });
      jest
        .spyOn(prismaService.resolution, 'findUnique')
        .mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Resolution not found',
      );
    });

    it('should throw ForbiddenException when resolution does not belong to event', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'other-event',
        resolutionId: 'resolution-123',
      });
      jest
        .spyOn(prismaService.resolution, 'findUnique')
        .mockResolvedValue(mockResolution);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should query resolution with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'event-123',
        resolutionId: 'resolution-123',
      });
      jest
        .spyOn(prismaService.resolution, 'findUnique')
        .mockResolvedValue(mockResolution);

      await guard.canActivate(context);

      expect(prismaService.resolution.findUnique).toHaveBeenCalledWith({
        where: { id: 'resolution-123' },
      });
    });
  });
});
