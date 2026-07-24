import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { SessionStreamerController } from '../session-streamer.controller';
import { SessionStreamerService } from '../session-streamer.service';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { SessionGuard } from '../../session/guard/session.guard';
import { SessionStreamerGuard } from '../guard/session-streamer.guard';
import {
  createMockSessionStreamer,
  createMockSessionStreamerWithUser,
} from './fixtures/session-streamer.fixture';
import {
  createMockSession,
  createMockUser,
} from '../../session/test/fixtures/session.fixture';

describe('SessionStreamerController', () => {
  let controller: SessionStreamerController;
  let service: SessionStreamerService;

  const mockStreamer = createMockSessionStreamer();
  const mockSession = createMockSession();
  const mockUser = createMockUser();

  const mockService = {
    getSessionStreamerList: jest.fn(),
    generateInviteLink: jest.fn(),
    updateSessionStreamer: jest.fn(),
    deleteSessionStreamer: jest.fn(),
    getOverlayLink: jest.fn(),
  };

  const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockStreamerGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      context.switchToHttp().getRequest().sessionStreamer = mockStreamer;
      return true;
    }),
  };
  const mockSessionGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      context.switchToHttp().getRequest().session = mockSession;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionStreamerController],
      providers: [{ provide: SessionStreamerService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(SessionGuard)
      .useValue(mockSessionGuard)
      .overrideGuard(SessionStreamerGuard)
      .useValue(mockStreamerGuard)
      .compile();

    controller = module.get(SessionStreamerController);
    service = module.get(SessionStreamerService);
    jest.clearAllMocks();
  });

  describe('getSessionStreamerList', () => {
    it('should return list of streamers', async () => {
      const mockStreamers = [createMockSessionStreamerWithUser()];
      jest
        .spyOn(service, 'getSessionStreamerList')
        .mockResolvedValue(mockStreamers);

      const result = await controller.getSessionStreamerList(mockSession);

      expect(result).toEqual(mockStreamers);
      expect(service.getSessionStreamerList).toHaveBeenCalledWith(
        'session-123',
      );
    });
  });

  describe('generateInviteLink', () => {
    it('should return invite link', () => {
      const mockLink = {
        inviteUrl: 'http://localhost:3000/invite/session-123',
        sessionId: 'session-123',
      };

      jest.spyOn(service, 'generateInviteLink').mockReturnValue(mockLink);

      const result = controller.generateInviteLink(mockSession);

      expect(result).toEqual(mockLink);
      expect(service.generateInviteLink).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('updateSessionStreamer', () => {
    it('should update streamer permissions', async () => {
      const mockUpdated = createMockSessionStreamer({ canViewPlayers: true });
      jest
        .spyOn(service, 'updateSessionStreamer')
        .mockResolvedValue(mockUpdated);

      const result = await controller.updateSessionStreamer(
        { canViewPlayers: true },
        mockStreamer,
      );

      expect(result).toEqual(mockUpdated);
      expect(service.updateSessionStreamer).toHaveBeenCalledWith(
        { canViewPlayers: true },
        mockStreamer,
      );
    });
  });

  describe('deleteSessionStreamer', () => {
    it('should delete and return streamer', async () => {
      jest
        .spyOn(service, 'deleteSessionStreamer')
        .mockResolvedValue(mockStreamer);

      const result = await controller.deleteSessionStreamer(mockStreamer);

      expect(result).toEqual(mockStreamer);
      expect(service.deleteSessionStreamer).toHaveBeenCalledWith(mockStreamer);
    });
  });

  describe('getMyOverlayLink', () => {
    it("should return the requesting user's overlay links", async () => {
      const mockOverlayLink = {
        overlays: [
          {
            type: 'milestones',
            url: 'https://overlay.app/overlay/session-123/milestones?token=xxx',
            enabled: true,
          },
        ],
      };
      jest.spyOn(service, 'getOverlayLink').mockResolvedValue(mockOverlayLink);

      const result = await controller.getMyOverlayLink('session-123', mockUser);

      expect(result).toEqual(mockOverlayLink);
      expect(service.getOverlayLink).toHaveBeenCalledWith(
        'session-123',
        mockUser.sub,
      );
    });
  });
});
