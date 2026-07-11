import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SessionStreamerGuard } from '../guard/session-streamer.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockSessionStreamer } from './fixtures/session-streamer.fixture';

describe('SessionStreamerGuard', () => {
  let guard: SessionStreamerGuard;

  const mockStreamer = createMockSessionStreamer();

  const mockPrisma = {
    sessionStreamer: {
      findUnique: jest.fn().mockResolvedValue(mockStreamer),
    },
  };

  const createMockContext = (
    overrides: {
      userId?: string;
      sessionId?: string;
      streamerId?: string;
    } = {},
  ): ExecutionContext => {
    const request = {
      user: { sub: overrides.userId ?? 'user-123' },
      params: {
        id: overrides.sessionId ?? 'session-123',
        streamerId: overrides.streamerId ?? 'session-streamer-123',
      },
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionStreamerGuard,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    guard = module.get(SessionStreamerGuard);
    jest.clearAllMocks();
  });

  it('should return true and set sessionStreamer on request when valid', async () => {
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue(mockStreamer);

    const context = createMockContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest().sessionStreamer).toEqual(
      mockStreamer,
    );
  });

  it('should throw ForbiddenException when user not authenticated', async () => {
    const context = createMockContext();
    context.switchToHttp().getRequest().user = undefined;

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw BadRequestException when streamerId is missing', async () => {
    const context = createMockContext({ streamerId: '' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when streamer not found', async () => {
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(createMockContext())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when streamer belongs to different session', async () => {
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue({
      ...mockStreamer,
      sessionId: 'other-session',
    });

    await expect(guard.canActivate(createMockContext())).rejects.toThrow(
      ForbiddenException,
    );
  });
});
