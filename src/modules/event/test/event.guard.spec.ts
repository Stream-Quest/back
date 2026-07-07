import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventGuard } from '../guard/event.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockEvent } from './fixtures/event.fixture';

const createMockPrismaService = () => ({
  event: { findUnique: jest.fn() },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    eventId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: { id: overrides.eventId ?? 'event-123' },
    event: undefined,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

describe('EventGuard', () => {
  let guard: EventGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockEvent = createMockEvent();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventGuard,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    guard = module.get(EventGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when event exists and user is owner', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'event-123',
      });
      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue(mockEvent);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach event to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'event-123',
      });
      const request = context.switchToHttp().getRequest();
      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue(mockEvent);

      await guard.canActivate(context);

      expect(request.event).toEqual(mockEvent);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        eventId: 'event-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when event id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Event id not provided',
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        eventId: 'not-found',
      });
      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Event not found',
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const context = createMockExecutionContext({
        userId: 'other-user',
        eventId: 'event-123',
      });
      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue(mockEvent);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
