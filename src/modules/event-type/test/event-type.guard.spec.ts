import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventTypeGuard } from '../guard/event-type.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockEventType } from './fixtures/event-type.fixture';

const createMockPrismaService = () => ({
  eventType: {
    findUnique: jest.fn(),
  },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    eventTypeId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: { id: overrides.eventTypeId ?? 'event-type-123' },
    eventType: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('EventTypeGuard', () => {
  let guard: EventTypeGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockEventType = createMockEventType();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventTypeGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get(EventTypeGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when event type exists and user is authenticated', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventTypeId: 'event-type-123',
      });

      jest
        .spyOn(prismaService.eventType, 'findUnique')
        .mockResolvedValue(mockEventType);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach event type to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventTypeId: 'event-type-123',
      });
      const request = context.switchToHttp().getRequest();

      jest
        .spyOn(prismaService.eventType, 'findUnique')
        .mockResolvedValue(mockEventType);

      await guard.canActivate(context);

      expect(request.eventType).toEqual(mockEventType);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        eventTypeId: 'event-type-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when event type id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventTypeId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'EventType id not provided',
      );
    });

    it('should throw NotFoundException when event type is not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventTypeId: 'not-found',
      });

      jest.spyOn(prismaService.eventType, 'findUnique').mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'EventType not found',
      );
    });

    it('should query event type with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventTypeId: 'event-type-123',
      });

      jest
        .spyOn(prismaService.eventType, 'findUnique')
        .mockResolvedValue(mockEventType);

      await guard.canActivate(context);

      expect(prismaService.eventType.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-type-123' },
      });
    });
  });
});
