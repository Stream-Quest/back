import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionEventGuard } from '../guard/session-event.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockSessionEvent } from './fixtures/session-event.fixture';

const createMockPrismaService = () => ({
  sessionEvent: { findUnique: jest.fn() },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    sessionId?: string;
    sessionEventId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: {
      id: overrides.sessionId ?? 'session-123',
      sessionEventId: overrides.sessionEventId ?? 'session-event-123',
    },
    sessionEvent: undefined,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

describe('SessionEventGuard', () => {
  let guard: SessionEventGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockSessionEvent = createMockSessionEvent();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionEventGuard,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    guard = module.get(SessionEventGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when session event exists and belongs to session', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'session-123',
        sessionEventId: 'session-event-123',
      });
      jest
        .spyOn(prismaService.sessionEvent, 'findUnique')
        .mockResolvedValue(mockSessionEvent);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach session event to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'session-123',
        sessionEventId: 'session-event-123',
      });
      const request = context.switchToHttp().getRequest();
      jest
        .spyOn(prismaService.sessionEvent, 'findUnique')
        .mockResolvedValue(mockSessionEvent);

      await guard.canActivate(context);

      expect(request.sessionEvent).toEqual(mockSessionEvent);
    });

    it('should throw ForbiddenException when user not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        sessionEventId: 'session-event-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when session event id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionEventId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Session event id not provided',
      );
    });

    it('should throw NotFoundException when session event not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionEventId: 'not-found',
      });
      jest
        .spyOn(prismaService.sessionEvent, 'findUnique')
        .mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Session event not found',
      );
    });

    it('should throw ForbiddenException when session event does not belong to session', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'other-session',
        sessionEventId: 'session-event-123',
      });
      jest
        .spyOn(prismaService.sessionEvent, 'findUnique')
        .mockResolvedValue(mockSessionEvent);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should query session event with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'session-123',
        sessionEventId: 'session-event-123',
      });
      jest
        .spyOn(prismaService.sessionEvent, 'findUnique')
        .mockResolvedValue(mockSessionEvent);

      await guard.canActivate(context);

      expect(prismaService.sessionEvent.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-event-123' },
      });
    });
  });
});
