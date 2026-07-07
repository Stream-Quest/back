import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { PlayerCharacterController } from '../player-character.controller';
import { PlayerCharacterService } from '../player-character.service';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { PlayerCharacterGuard } from '../guard/player-character.guard';
import { createMockPlayerCharacter } from './fixtures/player-character.fixture';
import { createMockPlayerCharacterService } from './mocks/player-character.service.mock';

describe('PlayerCharacterController', () => {
  let controller: PlayerCharacterController;
  let service: PlayerCharacterService;

  const mockPlayerCharacter = createMockPlayerCharacter();
  const mockService = createMockPlayerCharacterService();

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 'user-123', username: 'testuser' };
      return true;
    }),
  };

  const mockPlayerCharacterGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.playerCharacter = mockPlayerCharacter;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerCharacterController],
      providers: [
        {
          provide: PlayerCharacterService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(PlayerCharacterGuard)
      .useValue(mockPlayerCharacterGuard)
      .compile();

    controller = module.get(PlayerCharacterController);
    service = module.get(PlayerCharacterService);

    jest.clearAllMocks();
  });

  describe('playerCharacterList', () => {
    it('should return paginated player character list', async () => {
      const mockResponse = {
        data: [mockPlayerCharacter],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest
        .spyOn(service, 'getPlayerCharacterList')
        .mockResolvedValue(mockResponse);

      const result = await controller.playerCharacterList({ limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(service.getPlayerCharacterList).toHaveBeenCalledWith({
        limit: 10,
      });
    });
  });

  describe('playerCharacterDetails', () => {
    it('should return player character details', async () => {
      jest
        .spyOn(service, 'getPlayerCharacter')
        .mockResolvedValue(mockPlayerCharacter);

      const result = await controller.playerCharacterDetails(
        'player-character-123',
      );

      expect(result).toEqual(mockPlayerCharacter);
      expect(service.getPlayerCharacter).toHaveBeenCalledWith(
        'player-character-123',
      );
    });
  });

  describe('createPlayerCharacter', () => {
    it('should create and return a player character', async () => {
      const createDto = {
        name: 'Magendok',
        class: 'Fiend Warlock',
        level: 4,
        avatarUrl: 'https://random.url/random-image',
        isAlive: true,
        displayAvatar: true,
        displayClass: true,
        displayLevel: true,
        campaignId: 'campaign-123',
      };
      jest
        .spyOn(service, 'createPlayerCharacter')
        .mockResolvedValue(mockPlayerCharacter);

      const result = await controller.createPlayerCharacter(createDto);

      expect(result).toEqual(mockPlayerCharacter);
      expect(service.createPlayerCharacter).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updatePlayerCharacter', () => {
    it('should update and return a player character', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedPlayerCharacter = createMockPlayerCharacter({
        name: 'Updated Name',
      });
      jest
        .spyOn(service, 'updatePlayerCharacter')
        .mockResolvedValue(updatedPlayerCharacter);

      const result = await controller.updatePlayerCharacter(
        updateDto,
        mockPlayerCharacter,
      );

      expect(result).toEqual(updatedPlayerCharacter);
      expect(service.updatePlayerCharacter).toHaveBeenCalledWith(
        updateDto,
        mockPlayerCharacter,
      );
    });
  });

  describe('deletePlayerCharacter', () => {
    it('should delete and return a player character', async () => {
      jest
        .spyOn(service, 'deletePlayerCharacter')
        .mockResolvedValue(mockPlayerCharacter);

      const result =
        await controller.deletePlayerCharacter(mockPlayerCharacter);

      expect(result).toEqual(mockPlayerCharacter);
      expect(service.deletePlayerCharacter).toHaveBeenCalledWith(
        mockPlayerCharacter,
      );
    });
  });

  describe('Guards', () => {
    it('should apply JwtAuthGuard to all routes', () => {
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });

    it('should apply PlayerCharacterGuard to protected routes', () => {
      expect(mockPlayerCharacterGuard.canActivate).toBeDefined();
    });
  });
});
