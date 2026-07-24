import { Test, TestingModule } from '@nestjs/testing';
import { SessionPlayerCharacterRepository } from '../session-player-character.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CharacterStatus,
  PlayerStatus,
} from '../../../generated/prisma/client';
import {
  createMockSessionPlayerCharacter,
  createMockSessionPlayerCharacterWithDetails,
} from './fixtures/session-player-character.fixture';
import { createMockSessionPlayerCharacterPrismaService } from './mocks/session-player-character.prisma.mock';

describe('SessionPlayerCharacterRepository', () => {
  let repository: SessionPlayerCharacterRepository;
  let prismaService: PrismaService;

  const mockSessionPlayerCharacter = createMockSessionPlayerCharacter();
  const mockSessionPlayerCharacterWithDetails =
    createMockSessionPlayerCharacterWithDetails();
  const mockPrismaService = createMockSessionPlayerCharacterPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionPlayerCharacterRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get(SessionPlayerCharacterRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getSessionPlayerCharacterList', () => {
    it('should return the list of active session player characters with details', async () => {
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findMany')
        .mockResolvedValue([mockSessionPlayerCharacterWithDetails]);

      const result =
        await repository.getSessionPlayerCharacterList('session-123');

      expect(result).toEqual([mockSessionPlayerCharacterWithDetails]);
      expect(
        prismaService.sessionPlayerCharacter.findMany,
      ).toHaveBeenCalledWith({
        where: { sessionId: 'session-123', leftAt: null },
        include: {
          playerCharacter: {
            select: expect.objectContaining({
              id: true,
              name: true,
              maxHp: true,
              displayStatus: true,
            }),
          },
        },
        orderBy: { joinedAt: 'asc' },
      });
    });

    it('should return an empty array when no player characters are active', async () => {
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findMany')
        .mockResolvedValue([]);

      const result =
        await repository.getSessionPlayerCharacterList('session-123');

      expect(result).toEqual([]);
    });
  });

  describe('getSessionPlayerCharacter', () => {
    it('should return session player character when found', async () => {
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findUnique')
        .mockResolvedValue(mockSessionPlayerCharacter);

      const result = await repository.getSessionPlayerCharacter(
        'session-player-character-123',
      );

      expect(result).toEqual(mockSessionPlayerCharacter);
      expect(
        prismaService.sessionPlayerCharacter.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 'session-player-character-123' },
      });
    });

    it('should return null when not found', async () => {
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'findUnique')
        .mockResolvedValue(null);

      const result = await repository.getSessionPlayerCharacter('not-found');

      expect(result).toBeNull();
    });
  });

  describe('getPlayerCharacterWithMaxHp', () => {
    it('should return the max hp of the player character when found', async () => {
      mockPrismaService.playerCharacter.findUnique.mockResolvedValue({
        maxHp: 55,
      });

      const result = await repository.getPlayerCharacterWithMaxHp(
        'player-character-123',
      );

      expect(result).toEqual({ maxHp: 55 });
      expect(prismaService.playerCharacter.findUnique).toHaveBeenCalledWith({
        where: { id: 'player-character-123' },
        select: { maxHp: true },
      });
    });

    it('should return null when player character not found', async () => {
      mockPrismaService.playerCharacter.findUnique.mockResolvedValue(null);

      const result = await repository.getPlayerCharacterWithMaxHp('not-found');

      expect(result).toBeNull();
    });
  });

  describe('createSessionPlayerCharacter', () => {
    it('should create and return a session player character', async () => {
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'create')
        .mockResolvedValue(mockSessionPlayerCharacter);

      const result = await repository.createSessionPlayerCharacter(
        'session-123',
        'player-character-123',
        45,
      );

      expect(result).toEqual(mockSessionPlayerCharacter);
      expect(prismaService.sessionPlayerCharacter.create).toHaveBeenCalledWith({
        data: {
          session: { connect: { id: 'session-123' } },
          playerCharacter: { connect: { id: 'player-character-123' } },
          joinedAt: expect.any(Date),
          currentHp: 45,
        },
      });
    });

    it('should create with a null currentHp when not provided', async () => {
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'create')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await repository.createSessionPlayerCharacter(
        'session-123',
        'player-character-123',
        null,
      );

      const callArg = (prismaService.sessionPlayerCharacter.create as jest.Mock)
        .mock.calls[0][0];
      expect(callArg.data.currentHp).toBeNull();
    });
  });

  describe('updateSessionPlayerCharacter', () => {
    it('should update currentHp when provided', async () => {
      const updated = createMockSessionPlayerCharacter({ currentHp: 20 });
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'update')
        .mockResolvedValue(updated);

      const result = await repository.updateSessionPlayerCharacter(
        'session-player-character-123',
        { currentHp: 20 },
      );

      expect(result).toEqual(updated);
      expect(prismaService.sessionPlayerCharacter.update).toHaveBeenCalledWith({
        where: { id: 'session-player-character-123' },
        data: { currentHp: 20 },
      });
    });

    it('should update charStatus when provided', async () => {
      const updated = createMockSessionPlayerCharacter({
        charStatus: CharacterStatus.HURT,
      });
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'update')
        .mockResolvedValue(updated);

      await repository.updateSessionPlayerCharacter(
        'session-player-character-123',
        { charStatus: CharacterStatus.HURT },
      );

      expect(prismaService.sessionPlayerCharacter.update).toHaveBeenCalledWith({
        where: { id: 'session-player-character-123' },
        data: { charStatus: CharacterStatus.HURT },
      });
    });

    it('should update both currentHp and charStatus when both provided', async () => {
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'update')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await repository.updateSessionPlayerCharacter(
        'session-player-character-123',
        { currentHp: 10, charStatus: CharacterStatus.CRITICAL },
      );

      expect(prismaService.sessionPlayerCharacter.update).toHaveBeenCalledWith({
        where: { id: 'session-player-character-123' },
        data: { currentHp: 10, charStatus: CharacterStatus.CRITICAL },
      });
    });

    it('should send an empty data object when neither field is provided', async () => {
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'update')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await repository.updateSessionPlayerCharacter(
        'session-player-character-123',
        {},
      );

      expect(prismaService.sessionPlayerCharacter.update).toHaveBeenCalledWith({
        where: { id: 'session-player-character-123' },
        data: {},
      });
    });
  });

  describe('removeSessionPlayerCharacter', () => {
    it('should set leftAt and status to LEFT', async () => {
      const removed = createMockSessionPlayerCharacter({
        leftAt: new Date('2024-01-02T10:00:00.000Z'),
        status: PlayerStatus.LEFT,
      });
      jest
        .spyOn(prismaService.sessionPlayerCharacter, 'update')
        .mockResolvedValue(removed);

      const result = await repository.removeSessionPlayerCharacter(
        'session-player-character-123',
      );

      expect(result).toEqual(removed);
      expect(prismaService.sessionPlayerCharacter.update).toHaveBeenCalledWith({
        where: { id: 'session-player-character-123' },
        data: { leftAt: expect.any(Date), status: 'LEFT' },
      });
    });
  });
});
