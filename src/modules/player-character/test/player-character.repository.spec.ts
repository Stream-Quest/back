import { Test, TestingModule } from '@nestjs/testing';
import { PlayerCharacterRepository } from '../player-character.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockPlayerCharacter } from './fixtures/player-character.fixture';
import { createMockPrismaService } from './mocks/player-character.prisma.mock';

describe('PlayerCharacterRepository', () => {
  let repository: PlayerCharacterRepository;
  let prismaService: PrismaService;

  const mockPlayerCharacter = createMockPlayerCharacter();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerCharacterRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(PlayerCharacterRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getPlayerCharacter', () => {
    it('should return a player character when found', async () => {
      jest
        .spyOn(prismaService.playerCharacter, 'findUnique')
        .mockResolvedValue(mockPlayerCharacter);

      const result = await repository.getPlayerCharacter({
        id: 'player-character-123',
      });

      expect(result).toEqual(mockPlayerCharacter);
      expect(prismaService.playerCharacter.findUnique).toHaveBeenCalledWith({
        where: { id: 'player-character-123' },
      });
    });

    it('should return null when player character not found', async () => {
      jest
        .spyOn(prismaService.playerCharacter, 'findUnique')
        .mockResolvedValue(null);

      const result = await repository.getPlayerCharacter({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('getPlayerCharacterList', () => {
    const mockPlayerCharacters = [
      createMockPlayerCharacter({ id: 'player-character-1', name: 'Axel' }),
      createMockPlayerCharacter({ id: 'player-character-2', name: 'Magendok' }),
    ];

    it('should return player characters in forward direction', async () => {
      jest
        .spyOn(prismaService.playerCharacter, 'findMany')
        .mockResolvedValue(mockPlayerCharacters);

      const result = await repository.getPlayerCharacterList(
        {},
        {
          take: 10,
          direction: 'forward',
        },
      );

      expect(result).toEqual(mockPlayerCharacters);
      expect(prismaService.playerCharacter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return player characters in backward direction (reversed)', async () => {
      jest
        .spyOn(prismaService.playerCharacter, 'findMany')
        .mockResolvedValue([...mockPlayerCharacters]);

      const result = await repository.getPlayerCharacterList(
        {},
        {
          take: 10,
          direction: 'backward',
          cursor: 'cursor-123',
        },
      );

      expect(result).toEqual([
        mockPlayerCharacters[1],
        mockPlayerCharacters[0],
      ]);
      expect(prismaService.playerCharacter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: -10,
          skip: 1,
          cursor: { id: 'cursor-123' },
        }),
      );
    });

    it('should use default take value of 10', async () => {
      jest
        .spyOn(prismaService.playerCharacter, 'findMany')
        .mockResolvedValue(mockPlayerCharacters);

      await repository.getPlayerCharacterList({});

      expect(prismaService.playerCharacter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('createPlayerCharacter', () => {
    it('should create and return a player character', async () => {
      jest
        .spyOn(prismaService.playerCharacter, 'create')
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

      const result = await repository.createPlayerCharacter(dto);

      expect(result).toEqual(mockPlayerCharacter);
      expect(prismaService.playerCharacter.create).toHaveBeenCalledWith({
        data: {
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
          campaign: {
            connect: { id: 'campaign-123' },
          },
        },
      });
    });

    it('should not include campaignId directly in data, using connect instead', async () => {
      jest
        .spyOn(prismaService.playerCharacter, 'create')
        .mockResolvedValue(mockPlayerCharacter);

      await repository.createPlayerCharacter({
        name: 'Axel',
        campaignId: 'campaign-456',
        isAlive: true,
        displayAvatar: true,
        displayClass: true,
        displayLevel: true,
        displayHp: true,
        displayArmorClass: true,
      });

      const callArg = (prismaService.playerCharacter.create as jest.Mock).mock
        .calls[0][0];

      expect(callArg.data.campaignId).toBeUndefined();
      expect(callArg.data.campaign).toEqual({
        connect: { id: 'campaign-456' },
      });
    });
  });

  describe('updatePlayerCharacter', () => {
    it('should update and return a player character', async () => {
      const updatedPlayerCharacter = createMockPlayerCharacter({
        name: 'Updated Name',
      });
      jest
        .spyOn(prismaService.playerCharacter, 'update')
        .mockResolvedValue(updatedPlayerCharacter);

      const result = await repository.updatePlayerCharacter(
        { id: 'player-character-123' },
        { name: 'Updated Name' },
      );

      expect(result).toEqual(updatedPlayerCharacter);
      expect(prismaService.playerCharacter.update).toHaveBeenCalledWith({
        where: { id: 'player-character-123' },
        data: { name: 'Updated Name' },
      });
    });
  });

  describe('deletePlayerCharacter', () => {
    it('should delete and return a player character', async () => {
      jest
        .spyOn(prismaService.playerCharacter, 'delete')
        .mockResolvedValue(mockPlayerCharacter);

      const result = await repository.deletePlayerCharacter({
        id: 'player-character-123',
      });

      expect(result).toEqual(mockPlayerCharacter);
      expect(prismaService.playerCharacter.delete).toHaveBeenCalledWith({
        where: { id: 'player-character-123' },
      });
    });
  });
});
