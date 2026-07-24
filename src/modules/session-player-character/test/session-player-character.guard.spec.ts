import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionPlayerCharacterGuard } from '../guard/session-player-character.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockSessionPlayerCharacter } from './fixtures/session-player-character.fixture';

const createMockPrismaService = () => ({
  sessionPlayerCharacter: { findUnique: jest.fn() },
});

const createMockExecutionContext = (
  overrides: {
    sessionId?: string;
    spcId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    params: {
      id: overrides.sessionId ?? 'session-123',
      spcId: overrides.spcId ?? 'session-player-character-123',
    },
    sessionPlayerCharacter: undefined,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

describe('SessionPlayerCharacterGuard', () => {
  let guard: SessionPlayerCharacterGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockSessionPlayerCharacter = createMockSessionPlayerCharacter();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionPlayerCharacterGuard,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    guard = module.get(SessionPlayerCharacterGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when the session player character exists and belongs to the session', async () => {
      const context = createMockExecutionContext({
        sessionId: 'session-123',
        spcId: 'session-player-character-123',
      });
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findUnique')
        .mockResolvedValue(mockSessionPlayerCharacter);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach the session player character to the request', async () => {
      const context = createMockExecutionContext({
        sessionId: 'session-123',
        spcId: 'session-player-character-123',
      });
      const request = context.switchToHttp().getRequest();
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findUnique')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await guard.canActivate(context);

      expect(request.sessionPlayerCharacter).toEqual(
        mockSessionPlayerCharacter,
      );
    });

    it('should throw BadRequestException when spcId is missing', async () => {
      const context = createMockExecutionContext({ spcId: '' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'SessionPlayerCharacter id not provided',
      );
    });

    it('should throw NotFoundException when the session player character is not found', async () => {
      const context = createMockExecutionContext({ spcId: 'not-found' });
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findUnique')
        .mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'SessionPlayerCharacter not found',
      );
    });

    it('should throw ForbiddenException when the session player character does not belong to the session', async () => {
      const context = createMockExecutionContext({
        sessionId: 'other-session',
        spcId: 'session-player-character-123',
      });
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findUnique')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'You do not have permission to access this player character',
      );
    });

    it('should query the session player character with the correct id', async () => {
      const context = createMockExecutionContext({
        sessionId: 'session-123',
        spcId: 'session-player-character-123',
      });
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findUnique')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await guard.canActivate(context);

      expect(
        prismaService.sessionPlayerCharacter.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 'session-player-character-123' },
      });
    });
  });
});
