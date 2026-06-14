import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerCharacterGuard } from '../guard/player-character.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPlayerCharacter } from './fixtures/player-character.fixture';

const createMockPrismaService = () => ({
  playerCharacter: {
    findUnique: jest.fn(),
  },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    playerCharacterId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: { id: overrides.playerCharacterId ?? 'player-character-123' },
    playerCharacter: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('PlayerCharacterGuard', () => {
  let guard: PlayerCharacterGuard;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockPlayerCharacter = createMockPlayerCharacter();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerCharacterGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get(PlayerCharacterGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when player character exists and user is authenticated', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        playerCharacterId: 'player-character-123',
      });

      jest
        .spyOn(prismaService.playerCharacter, 'findUnique')
        .mockResolvedValue(mockPlayerCharacter);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach player character to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        playerCharacterId: 'player-character-123',
      });
      const request = context.switchToHttp().getRequest();

      jest
        .spyOn(prismaService.playerCharacter, 'findUnique')
        .mockResolvedValue(mockPlayerCharacter);

      await guard.canActivate(context);

      expect(request.playerCharacter).toEqual(mockPlayerCharacter);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        playerCharacterId: 'player-character-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when player character id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        playerCharacterId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'PlayerCharacter id not provided',
      );
    });

    it('should throw NotFoundException when player character is not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        playerCharacterId: 'not-found',
      });

      jest
        .spyOn(prismaService.playerCharacter, 'findUnique')
        .mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'PlayerCharacter not found',
      );
    });

    it('should query player character with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        playerCharacterId: 'player-character-123',
      });

      jest
        .spyOn(prismaService.playerCharacter, 'findUnique')
        .mockResolvedValue(mockPlayerCharacter);

      await guard.canActivate(context);

      expect(prismaService.playerCharacter.findUnique).toHaveBeenCalledWith({
        where: { id: 'player-character-123' },
      });
    });
  });
});
