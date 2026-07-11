import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionStreamerService } from '../session-streamer.service';
import { SessionStreamerRepository } from '../session-streamer.repository';
import { createMockSessionStreamerRepository } from './mocks/session-streamer.repository.mock';
import {
  createMockSessionStreamer,
  createMockSessionStreamerWithUser,
  createMockSessionWithCampaign,
} from './fixtures/session-streamer.fixture';
import { createMockSession } from '../../session/test/fixtures/session.fixture';

describe('SessionStreamerService', () => {
  let service: SessionStreamerService;
  let repository: SessionStreamerRepository;

  const mockRepository = createMockSessionStreamerRepository();
  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };
  const mockSession = createMockSession();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionStreamerService,
        { provide: SessionStreamerRepository, useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(SessionStreamerService);
    repository = module.get(SessionStreamerRepository);
    jest.clearAllMocks();
  });

  describe('getSessionStreamerList', () => {
    it('should return list of streamers', async () => {
      const mockStreamers = [createMockSessionStreamerWithUser()];
      mockRepository.getSessionStreamerList.mockResolvedValue(mockStreamers);

      const result = await service.getSessionStreamerList('session-123');

      expect(result).toEqual(mockStreamers);
      expect(repository.getSessionStreamerList).toHaveBeenCalledWith(
        'session-123',
      );
    });
  });

  describe('generateInviteLink', () => {
    it('should return invite link with session id', () => {
      const result = service.generateInviteLink(mockSession);

      expect(result).toEqual({
        inviteUrl: 'http://localhost:3000/invite/session-123',
        sessionId: 'session-123',
      });
    });

    it('should use fallback URL when FRONTEND_URL not set', () => {
      mockConfigService.get.mockReturnValueOnce(undefined);

      const result = service.generateInviteLink(mockSession);

      expect(result.inviteUrl).toBe('http://localhost:3000/invite/session-123');
    });
  });

  describe('getInviteInfo', () => {
    it('should return session info', async () => {
      const mockSession = createMockSessionWithCampaign();
      mockRepository.getSessionWithCampaign.mockResolvedValue(mockSession);

      const result = await service.getInviteInfo('session-123');

      expect(result).toEqual({
        sessionId: 'session-123',
        sessionTitle: 'Session #12',
        campaignTitle: 'The Lost Chronicles',
        gmUsername: 'maengdok_',
      });
    });

    it('should throw NotFoundException when session not found', async () => {
      mockRepository.getSessionWithCampaign.mockResolvedValue(null);

      await expect(service.getInviteInfo('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('joinAsStreamer', () => {
    it('should create streamer when session exists and not already joined', async () => {
      const mockSession = createMockSessionWithCampaign();
      const mockStreamer = createMockSessionStreamer();
      mockRepository.getSessionWithCampaign.mockResolvedValue(mockSession);
      mockRepository.getSessionStreamerByUserAndSession.mockResolvedValue(null);
      mockRepository.createSessionStreamer.mockResolvedValue(mockStreamer);

      const result = await service.joinAsStreamer('session-123', 'user-123');

      expect(result).toEqual(mockStreamer);
      expect(repository.createSessionStreamer).toHaveBeenCalledWith(
        'session-123',
        'user-123',
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      mockRepository.getSessionWithCampaign.mockResolvedValue(null);

      await expect(
        service.joinAsStreamer('not-found', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already a streamer', async () => {
      const mockSession = createMockSessionWithCampaign();
      mockRepository.getSessionWithCampaign.mockResolvedValue(mockSession);
      mockRepository.getSessionStreamerByUserAndSession.mockResolvedValue(
        createMockSessionStreamer(),
      );

      await expect(
        service.joinAsStreamer('session-123', 'user-123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateSessionStreamer', () => {
    it('should update streamer permissions', async () => {
      const mockStreamer = createMockSessionStreamer();
      const mockUpdated = createMockSessionStreamer({ canViewPlayers: true });
      mockRepository.updateSessionStreamer.mockResolvedValue(mockUpdated);

      const result = await service.updateSessionStreamer(
        { canViewPlayers: true },
        mockStreamer,
      );

      expect(result).toEqual(mockUpdated);
      expect(repository.updateSessionStreamer).toHaveBeenCalledWith(
        mockStreamer.id,
        { canViewPlayers: true },
      );
    });
  });

  describe('deleteSessionStreamer', () => {
    it('should delete and return streamer', async () => {
      const mockStreamer = createMockSessionStreamer();
      mockRepository.deleteSessionStreamer.mockResolvedValue(mockStreamer);

      const result = await service.deleteSessionStreamer(mockStreamer);

      expect(result).toEqual(mockStreamer);
      expect(repository.deleteSessionStreamer).toHaveBeenCalledWith(
        mockStreamer.id,
      );
    });
  });
});
