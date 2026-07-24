import { Test, TestingModule } from '@nestjs/testing';
import { OverlayController } from '../overlay.controller';
import { OverlayService } from '../overlay.service';
import { OverlayGuard } from '../guard/overlay.guard';
import { createMockOverlayService } from './mocks/overlay.service.mock';
import {
  createMockActivePlayer,
  createMockCampaignKarma,
  createMockContextSnapshot,
  createMockMilestone,
  createMockSessionEvent,
} from './fixtures/overlay.fixture';

describe('OverlayController', () => {
  let controller: OverlayController;
  let service: OverlayService;

  const mockService = createMockOverlayService();

  const mockOverlayGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OverlayController],
      providers: [{ provide: OverlayService, useValue: mockService }],
    })
      .overrideGuard(OverlayGuard)
      .useValue(mockOverlayGuard)
      .compile();

    controller = module.get(OverlayController);
    service = module.get(OverlayService);
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should return session events', async () => {
      const mockEvents = [createMockSessionEvent()];
      jest.spyOn(service, 'getEvents').mockResolvedValue(mockEvents);

      const result = await controller.getEvents('session-123');

      expect(result).toEqual(mockEvents);
      expect(service.getEvents).toHaveBeenCalledWith('session-123');
    });
  });

  describe('getKarma', () => {
    it('should return campaign karma', async () => {
      const mockKarma = createMockCampaignKarma();
      jest.spyOn(service, 'getKarma').mockResolvedValue(mockKarma);

      const result = await controller.getKarma('session-123');

      expect(result).toEqual(mockKarma);
      expect(service.getKarma).toHaveBeenCalledWith('session-123');
    });
  });

  describe('getContext', () => {
    it('should return the latest context snapshot', async () => {
      const mockSnapshot = createMockContextSnapshot();
      jest.spyOn(service, 'getContext').mockResolvedValue(mockSnapshot);

      const result = await controller.getContext('session-123');

      expect(result).toEqual(mockSnapshot);
      expect(service.getContext).toHaveBeenCalledWith('session-123');
    });
  });

  describe('getPlayers', () => {
    it('should return active players', async () => {
      const mockPlayers = [createMockActivePlayer()];
      jest.spyOn(service, 'getPlayers').mockResolvedValue(mockPlayers);

      const result = await controller.getPlayers('session-123');

      expect(result).toEqual(mockPlayers);
      expect(service.getPlayers).toHaveBeenCalledWith('session-123');
    });
  });

  describe('getMilestones', () => {
    it('should return campaign milestones', async () => {
      const mockMilestones = [createMockMilestone()];
      jest.spyOn(service, 'getMilestones').mockResolvedValue(mockMilestones);

      const result = await controller.getMilestones('session-123');

      expect(result).toEqual(mockMilestones);
      expect(service.getMilestones).toHaveBeenCalledWith('session-123');
    });
  });
});
