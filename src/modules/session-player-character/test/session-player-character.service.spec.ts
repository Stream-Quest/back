import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SessionPlayerCharacterService } from '../session-player-character.service';
import { SessionPlayerCharacterRepository } from '../session-player-character.repository';
import { RedisService } from '../../../redis/redis.service';
import { CharacterStatus } from '../../../generated/prisma/client';
import {
  createMockSessionPlayerCharacter,
  createMockSessionPlayerCharacterWithDetails,
} from './fixtures/session-player-character.fixture';
import { createMockSessionPlayerCharacterRepository } from './mocks/session-player-character.repository.mock';
import { createMockRedisService } from '../../session/test/mocks/session.service.mock';
import { createMockSession } from '../../session/test/fixtures/session.fixture';

describe('SessionPlayerCharacterService', () => {
  let service: SessionPlayerCharacterService;
  let repository: SessionPlayerCharacterRepository;
  let redisService: RedisService;

  const mockSession = createMockSession();
  const mockSessionPlayerCharacter = createMockSessionPlayerCharacter();
  const mockRepository = createMockSessionPlayerCharacterRepository();
  const mockRedisService = createMockRedisService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionPlayerCharacterService,
        {
          provide: SessionPlayerCharacterRepository,
          useValue: mockRepository,
        },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get(SessionPlayerCharacterService);
    repository = module.get(SessionPlayerCharacterRepository);
    redisService = module.get(RedisService);

    jest.clearAllMocks();
  });

  describe('getSessionPlayerCharacterList', () => {
    it('should return the session player character list', async () => {
      const mockDetails = createMockSessionPlayerCharacterWithDetails();
      jest
        .spyOn(repository, 'getSessionPlayerCharacterList')
        .mockResolvedValue([mockDetails]);

      const result = await service.getSessionPlayerCharacterList('session-123');

      expect(result).toEqual([mockDetails]);
      expect(repository.getSessionPlayerCharacterList).toHaveBeenCalledWith(
        'session-123',
      );
    });
  });

  describe('createSessionPlayerCharacter', () => {
    it('should throw NotFoundException when player character does not exist', async () => {
      jest
        .spyOn(repository, 'getPlayerCharacterWithMaxHp')
        .mockResolvedValue(null);

      await expect(
        service.createSessionPlayerCharacter(
          { playerCharacterId: 'not-found' },
          mockSession,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use the provided currentHp when set', async () => {
      jest
        .spyOn(repository, 'getPlayerCharacterWithMaxHp')
        .mockResolvedValue({ maxHp: 55 });
      jest
        .spyOn(repository, 'createSessionPlayerCharacter')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await service.createSessionPlayerCharacter(
        { playerCharacterId: 'player-character-123', currentHp: 20 },
        mockSession,
      );

      expect(repository.createSessionPlayerCharacter).toHaveBeenCalledWith(
        mockSession.id,
        'player-character-123',
        20,
      );
    });

    it('should default currentHp to the player character maxHp when not provided', async () => {
      jest
        .spyOn(repository, 'getPlayerCharacterWithMaxHp')
        .mockResolvedValue({ maxHp: 55 });
      jest
        .spyOn(repository, 'createSessionPlayerCharacter')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await service.createSessionPlayerCharacter(
        { playerCharacterId: 'player-character-123' },
        mockSession,
      );

      expect(repository.createSessionPlayerCharacter).toHaveBeenCalledWith(
        mockSession.id,
        'player-character-123',
        55,
      );
    });

    it('should default currentHp to null when maxHp is also null', async () => {
      jest
        .spyOn(repository, 'getPlayerCharacterWithMaxHp')
        .mockResolvedValue({ maxHp: null });
      jest
        .spyOn(repository, 'createSessionPlayerCharacter')
        .mockResolvedValue(mockSessionPlayerCharacter);

      await service.createSessionPlayerCharacter(
        { playerCharacterId: 'player-character-123' },
        mockSession,
      );

      expect(repository.createSessionPlayerCharacter).toHaveBeenCalledWith(
        mockSession.id,
        'player-character-123',
        null,
      );
    });

    it('should return the created session player character', async () => {
      jest
        .spyOn(repository, 'getPlayerCharacterWithMaxHp')
        .mockResolvedValue({ maxHp: 55 });
      jest
        .spyOn(repository, 'createSessionPlayerCharacter')
        .mockResolvedValue(mockSessionPlayerCharacter);

      const result = await service.createSessionPlayerCharacter(
        { playerCharacterId: 'player-character-123' },
        mockSession,
      );

      expect(result).toEqual(mockSessionPlayerCharacter);
    });
  });

  describe('updateSessionPlayerCharacter', () => {
    it('should update and publish to Redis', async () => {
      const updated = createMockSessionPlayerCharacter({
        currentHp: 10,
        charStatus: CharacterStatus.HURT,
      });
      jest
        .spyOn(repository, 'updateSessionPlayerCharacter')
        .mockResolvedValue(updated);
      jest.spyOn(redisService, 'publish').mockResolvedValue();

      const result = await service.updateSessionPlayerCharacter(
        { currentHp: 10, charStatus: CharacterStatus.HURT },
        mockSessionPlayerCharacter,
        mockSession,
      );

      expect(result).toEqual(updated);
      expect(repository.updateSessionPlayerCharacter).toHaveBeenCalledWith(
        mockSessionPlayerCharacter.id,
        { currentHp: 10, charStatus: CharacterStatus.HURT },
      );
      expect(redisService.publish).toHaveBeenCalledWith(
        `session:${mockSession.id}:player-updated`,
        {
          sessionPlayerCharacterId: mockSessionPlayerCharacter.id,
          playerCharacterId: mockSessionPlayerCharacter.playerCharacterId,
          currentHp: updated.currentHp,
          charStatus: updated.charStatus,
        },
      );
    });
  });

  describe('removeSessionPlayerCharacter', () => {
    it('should remove and return the session player character', async () => {
      const removed = createMockSessionPlayerCharacter({ leftAt: new Date() });
      jest
        .spyOn(repository, 'removeSessionPlayerCharacter')
        .mockResolvedValue(removed);

      const result = await service.removeSessionPlayerCharacter(
        mockSessionPlayerCharacter,
      );

      expect(result).toEqual(removed);
      expect(repository.removeSessionPlayerCharacter).toHaveBeenCalledWith(
        mockSessionPlayerCharacter.id,
      );
    });
  });
});
