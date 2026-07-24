import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OverlayGuard } from '../guard/overlay.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  createMockOverlaySessionStreamer,
  createMockOverlayUser,
} from './fixtures/overlay.fixture';

describe('OverlayGuard', () => {
  let guard: OverlayGuard;

  const mockUser = createMockOverlayUser();
  const mockSessionStreamer = createMockOverlaySessionStreamer();

  const mockPrisma = {
    user: { findUnique: jest.fn() },
    sessionStreamer: { findUnique: jest.fn() },
  };

  const mockReflector = { get: jest.fn() };

  const createMockContext = (
    overrides: { token?: string; sessionId?: string } = {},
  ): ExecutionContext => {
    const request = {
      query: {
        token: overrides.token !== undefined ? overrides.token : 'valid-token',
      },
      params: {
        sessionId:
          overrides.sessionId !== undefined
            ? overrides.sessionId
            : 'session-123',
      },
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OverlayGuard,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get(OverlayGuard);
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue(
      mockSessionStreamer,
    );
    mockReflector.get.mockReturnValue(undefined);
  });

  it('should throw BadRequestException when token is missing', async () => {
    const context = createMockContext({ token: '' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Overlay token not provided',
    );
  });

  it('should throw BadRequestException when sessionId is missing', async () => {
    const context = createMockContext({ sessionId: '' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Session id not provided',
    );
  });

  it('should throw ForbiddenException when token does not match any user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Invalid overlay token',
    );
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { overlayToken: 'valid-token' },
    });
  });

  it('should throw NotFoundException when user has no SessionStreamer for this session', async () => {
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue(null);

    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Not attached to this session',
    );
    expect(mockPrisma.sessionStreamer.findUnique).toHaveBeenCalledWith({
      where: {
        sessionId_userId: { sessionId: 'session-123', userId: mockUser.id },
      },
    });
  });

  it('should throw ForbiddenException when canViewPlayers permission is false', async () => {
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue(
      createMockOverlaySessionStreamer({ canViewPlayers: false }),
    );
    mockReflector.get.mockReturnValue('canViewPlayers');

    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Missing overlay permission: canViewPlayers',
    );
  });

  it('should throw ForbiddenException when canViewKarma permission is false', async () => {
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue(
      createMockOverlaySessionStreamer({ canViewKarma: false }),
    );
    mockReflector.get.mockReturnValue('canViewKarma');

    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Missing overlay permission: canViewKarma',
    );
  });

  it('should return true and attach overlayContext when the required permission is granted', async () => {
    const streamer = createMockOverlaySessionStreamer({
      canViewEvents: true,
    });
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue(streamer);
    mockReflector.get.mockReturnValue('canViewEvents');

    const context = createMockContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest().overlayContext).toEqual({
      user: mockUser,
      sessionStreamer: streamer,
    });
  });

  it('should return true when no overlay permission is required by the route', async () => {
    mockPrisma.sessionStreamer.findUnique.mockResolvedValue(
      createMockOverlaySessionStreamer({
        canViewEvents: false,
        canViewKarma: false,
        canViewMilestones: false,
        canViewContext: false,
        canViewPlayers: false,
      }),
    );
    mockReflector.get.mockReturnValue(undefined);

    const context = createMockContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });
});
