import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { SessionPlayerCharacterController } from '../session-player-character.controller';
import { SessionPlayerCharacterService } from '../session-player-character.service';
import { CharacterStatus } from '../../../generated/prisma/client';
import { createMockSession } from '../../session/test/fixtures/session.fixture';
import {
  createMockSessionPlayerCharacter,
  createMockSessionPlayerCharacterWithDetails,
} from './fixtures/session-player-character.fixture';
import { createMockSessionPlayerCharacterService } from './mocks/session-player-character.service.mock';
import { createMockUser } from '../../session/test/fixtures/session.fixture';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { SessionGuard } from '../../session/guard/session.guard';
import { SessionPlayerCharacterGuard } from '../guard/session-player-character.guard';

describe('SessionPlayerCharacterController', () => {
  let controller: SessionPlayerCharacterController;
  let sessionPlayerCharacterService: SessionPlayerCharacterService;

  const mockUser = createMockUser();
  const mockSession = createMockSession();
  const mockSessionPlayerCharacter = createMockSessionPlayerCharacter();
  const mockSessionPlayerCharacterService =
    createMockSessionPlayerCharacterService();

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser;
      return true;
    }),
  };

  const mockSessionGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.session = mockSession;
      return true;
    }),
  };

  const mockSessionPlayerCharacterGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.sessionPlayerCharacter = mockSessionPlayerCharacter;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionPlayerCharacterController],
      providers: [
        {
          provide: SessionPlayerCharacterService,
          useValue: mockSessionPlayerCharacterService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(SessionGuard)
      .useValue(mockSessionGuard)
      .overrideGuard(SessionPlayerCharacterGuard)
      .useValue(mockSessionPlayerCharacterGuard)
      .compile();

    controller = module.get(SessionPlayerCharacterController);
    sessionPlayerCharacterService = module.get(SessionPlayerCharacterService);

    jest.clearAllMocks();
  });

  describe('getSessionPlayerCharacterList', () => {
    it('should return the session player character list', async () => {
      const mockDetails = createMockSessionPlayerCharacterWithDetails();
      jest
        .spyOn(sessionPlayerCharacterService, 'getSessionPlayerCharacterList')
        .mockResolvedValue([mockDetails]);

      const result =
        await controller.getSessionPlayerCharacterList(mockSession);

      expect(result).toEqual([mockDetails]);
      expect(
        sessionPlayerCharacterService.getSessionPlayerCharacterList,
      ).toHaveBeenCalledWith(mockSession.id);
    });
  });

  describe('createSessionPlayerCharacter', () => {
    it('should create and return a session player character', async () => {
      jest
        .spyOn(sessionPlayerCharacterService, 'createSessionPlayerCharacter')
        .mockResolvedValue(mockSessionPlayerCharacter);

      const dto = { playerCharacterId: 'player-character-123' };
      const result = await controller.createSessionPlayerCharacter(
        dto,
        mockSession,
      );

      expect(result).toEqual(mockSessionPlayerCharacter);
      expect(
        sessionPlayerCharacterService.createSessionPlayerCharacter,
      ).toHaveBeenCalledWith(dto, mockSession);
    });
  });

  describe('updateSessionPlayerCharacter', () => {
    it('should update and return a session player character', async () => {
      const updated = createMockSessionPlayerCharacter({
        currentHp: 20,
        charStatus: CharacterStatus.HURT,
      });
      jest
        .spyOn(sessionPlayerCharacterService, 'updateSessionPlayerCharacter')
        .mockResolvedValue(updated);

      const dto = { currentHp: 20, charStatus: CharacterStatus.HURT };
      const result = await controller.updateSessionPlayerCharacter(
        dto,
        mockSessionPlayerCharacter,
        mockSession,
      );

      expect(result).toEqual(updated);
      expect(
        sessionPlayerCharacterService.updateSessionPlayerCharacter,
      ).toHaveBeenCalledWith(dto, mockSessionPlayerCharacter, mockSession);
    });
  });

  describe('removeSessionPlayerCharacter', () => {
    it('should remove and return a session player character', async () => {
      const removed = createMockSessionPlayerCharacter({ leftAt: new Date() });
      jest
        .spyOn(sessionPlayerCharacterService, 'removeSessionPlayerCharacter')
        .mockResolvedValue(removed);

      const result = await controller.removeSessionPlayerCharacter(
        mockSessionPlayerCharacter,
      );

      expect(result).toEqual(removed);
      expect(
        sessionPlayerCharacterService.removeSessionPlayerCharacter,
      ).toHaveBeenCalledWith(mockSessionPlayerCharacter);
    });
  });
});
