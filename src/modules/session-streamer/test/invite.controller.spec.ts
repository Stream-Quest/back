import { Test, TestingModule } from '@nestjs/testing';
import { InviteController } from '../invite.controller';
import { SessionStreamerService } from '../session-streamer.service';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import {
  createMockSessionStreamer,
  createMockSessionWithCampaign,
} from './fixtures/session-streamer.fixture';

describe('InviteController', () => {
  let controller: InviteController;
  let service: SessionStreamerService;

  const mockService = {
    getInviteInfo: jest.fn(),
    joinAsStreamer: jest.fn(),
  };

  const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteController],
      providers: [{ provide: SessionStreamerService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get(InviteController);
    service = module.get(SessionStreamerService);
    jest.clearAllMocks();
  });

  describe('getInviteInfo', () => {
    it('should return session invite info', async () => {
      const session = createMockSessionWithCampaign();
      const mockInfo = {
        sessionId: session.id,
        sessionTitle: session.title,
        campaignTitle: session.campaign.title,
        gmUsername: session.campaign.gameMaster.username,
      };
      jest.spyOn(service, 'getInviteInfo').mockResolvedValue(mockInfo);

      const result = await controller.getInviteInfo('session-123');

      expect(result).toEqual(mockInfo);
      expect(service.getInviteInfo).toHaveBeenCalledWith('session-123');
    });
  });

  describe('joinAsStreamer', () => {
    it('should join session as streamer', async () => {
      const mockStreamer = createMockSessionStreamer();
      jest.spyOn(service, 'joinAsStreamer').mockResolvedValue(mockStreamer);

      const mockUser = {
        sub: 'user-123',
        username: 'player1_',
        type: 'gm' as const,
      };
      const result = await controller.joinAsStreamer('session-123', mockUser);

      expect(result).toEqual(mockStreamer);
      expect(service.joinAsStreamer).toHaveBeenCalledWith(
        'session-123',
        'user-123',
      );
    });
  });
});
