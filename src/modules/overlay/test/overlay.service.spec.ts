import { Test, TestingModule } from '@nestjs/testing';
import { OverlayService } from '../overlay.service';
import { OverlayRepository } from '../overlay.repository';
import { createMockOverlayRepository } from './mocks/overlay.repository.mock';
import {
  createMockActivePlayer,
  createMockCampaignKarma,
  createMockContextSnapshot,
  createMockMilestone,
  createMockSessionEvent,
} from './fixtures/overlay.fixture';

describe('OverlayService', () => {
  let service: OverlayService;
  let repository: OverlayRepository;

  const mockRepository = createMockOverlayRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OverlayService,
        { provide: OverlayRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(OverlayService);
    repository = module.get(OverlayRepository);
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should return events from the repository', async () => {
      const mockEvents = [createMockSessionEvent()];
      mockRepository.getEvents.mockResolvedValue(mockEvents);

      const result = await service.getEvents('session-123');

      expect(result).toEqual(mockEvents);
      expect(repository.getEvents).toHaveBeenCalledWith('session-123');
    });
  });

  describe('getKarma', () => {
    it('should return karma from the repository', async () => {
      const mockKarma = createMockCampaignKarma();
      mockRepository.getSessionCampaignKarma.mockResolvedValue(mockKarma);

      const result = await service.getKarma('session-123');

      expect(result).toEqual(mockKarma);
      expect(repository.getSessionCampaignKarma).toHaveBeenCalledWith(
        'session-123',
      );
    });
  });

  describe('getContext', () => {
    it('should return the latest context snapshot from the repository', async () => {
      const mockSnapshot = createMockContextSnapshot();
      mockRepository.getLatestContextSnapshot.mockResolvedValue(mockSnapshot);

      const result = await service.getContext('session-123');

      expect(result).toEqual(mockSnapshot);
      expect(repository.getLatestContextSnapshot).toHaveBeenCalledWith(
        'session-123',
      );
    });
  });

  describe('getPlayers', () => {
    it('should return active players from the repository', async () => {
      const mockPlayers = [createMockActivePlayer()];
      mockRepository.getActivePlayers.mockResolvedValue(mockPlayers);

      const result = await service.getPlayers('session-123');

      expect(result).toEqual(mockPlayers);
      expect(repository.getActivePlayers).toHaveBeenCalledWith('session-123');
    });
  });

  describe('getMilestones', () => {
    it('should return milestones for the session campaign', async () => {
      const mockMilestones = [createMockMilestone()];
      mockRepository.getSessionCampaignId.mockResolvedValue('campaign-123');
      mockRepository.getMilestones.mockResolvedValue(mockMilestones);

      const result = await service.getMilestones('session-123');

      expect(result).toEqual(mockMilestones);
      expect(repository.getSessionCampaignId).toHaveBeenCalledWith(
        'session-123',
      );
      expect(repository.getMilestones).toHaveBeenCalledWith('campaign-123');
    });

    it('should return an empty array when session has no campaign', async () => {
      mockRepository.getSessionCampaignId.mockResolvedValue(null);

      const result = await service.getMilestones('session-123');

      expect(result).toEqual([]);
      expect(repository.getMilestones).not.toHaveBeenCalled();
    });
  });
});
