import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PlayerCharacterService } from '../player-character.service';
import { PlayerCharacterRepository } from '../player-character.repository';
import { createMockPlayerCharacter } from './fixtures/player-character.fixture';
import { createMockPlayerCharacterRepository } from './mocks/player-character.repository.mock';

describe('PlayerCharacterService', () => {
  let service: PlayerCharacterService;
  let repository: PlayerCharacterRepository;

  const mockPlayerCharacter = createMockPlayerCharacter();
  const mockRepository = createMockPlayerCharacterRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerCharacterService,
        {
          provide: PlayerCharacterRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(PlayerCharacterService);
    repository = module.get(PlayerCharacterRepository);

    jest.clearAllMocks();
  });

  describe('getPlayerCharacterList', () => {
    it('should return paginated player character list', async () => {
      const mockPlayerCharacters = [
        createMockPlayerCharacter({ id: 'player-character-1' }),
        createMockPlayerCharacter({ id: 'player-character-2' }),
      ];
      jest
        .spyOn(repository, 'getPlayerCharacterList')
        .mockResolvedValue(mockPlayerCharacters);

      const result = await service.getPlayerCharacterList({ limit: 10 });

      expect(result.data).toEqual(mockPlayerCharacters);
      expect(result.count).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(repository.getPlayerCharacterList).toHaveBeenCalledWith(
        { campaignId: undefined },
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const mockPlayerCharacters = Array.from({ length: 11 }, (_, i) =>
        createMockPlayerCharacter({ id: `player-character-${i}` }),
      );
      jest
        .spyOn(repository, 'getPlayerCharacterList')
        .mockResolvedValue(mockPlayerCharacters);

      const result = await service.getPlayerCharacterList({ limit: 10 });

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('player-character-9');
    });

    it('should set hasPrevious when cursor is present', async () => {
      jest
        .spyOn(repository, 'getPlayerCharacterList')
        .mockResolvedValue([mockPlayerCharacter]);

      const result = await service.getPlayerCharacterList({
        cursor: 'some-cursor',
        limit: 10,
      });

      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('getPlayerCharacter', () => {
    it('should return a player character when found', async () => {
      jest
        .spyOn(repository, 'getPlayerCharacter')
        .mockResolvedValue(mockPlayerCharacter);

      const result = await service.getPlayerCharacter('player-character-123');

      expect(result).toEqual(mockPlayerCharacter);
      expect(repository.getPlayerCharacter).toHaveBeenCalledWith({
        id: 'player-character-123',
      });
    });

    it('should throw NotFoundException when player character not found', async () => {
      jest.spyOn(repository, 'getPlayerCharacter').mockResolvedValue(null);

      await expect(service.getPlayerCharacter('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getPlayerCharacter('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createPlayerCharacter', () => {
    it('should create and return a player character', async () => {
      jest
        .spyOn(repository, 'createPlayerCharacter')
        .mockResolvedValue(mockPlayerCharacter);

      const dto = {
        name: 'Magendok',
        class: 'Fiend Warlock',
        level: 4,
        avatarUrl: 'https://random.url/random-image',
        isAlive: true,
        displayAvatar: true,
        displayClass: true,
        displayLevel: true,
        displayHp: true,
        displayArmorClass: true,
        campaignId: 'campaign-123',
      };

      const result = await service.createPlayerCharacter(dto);

      expect(result).toEqual(mockPlayerCharacter);
      expect(repository.createPlayerCharacter).toHaveBeenCalledWith(dto);
    });
  });

  describe('updatePlayerCharacter', () => {
    it('should update and return a player character', async () => {
      const updatedPlayerCharacter = createMockPlayerCharacter({
        name: 'Updated Name',
      });
      jest
        .spyOn(repository, 'updatePlayerCharacter')
        .mockResolvedValue(updatedPlayerCharacter);

      const dto = { name: 'Updated Name' };
      const result = await service.updatePlayerCharacter(
        dto,
        mockPlayerCharacter,
      );

      expect(result).toEqual(updatedPlayerCharacter);
      expect(repository.updatePlayerCharacter).toHaveBeenCalledWith(
        { id: 'player-character-123' },
        dto,
      );
    });
  });

  describe('deletePlayerCharacter', () => {
    it('should delete and return a player character', async () => {
      jest
        .spyOn(repository, 'deletePlayerCharacter')
        .mockResolvedValue(mockPlayerCharacter);

      const result = await service.deletePlayerCharacter(mockPlayerCharacter);

      expect(result).toEqual(mockPlayerCharacter);
      expect(repository.deletePlayerCharacter).toHaveBeenCalledWith({
        id: 'player-character-123',
      });
    });
  });
});
