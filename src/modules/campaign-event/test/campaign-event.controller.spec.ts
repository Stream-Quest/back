import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { CampaignEventController } from '../campaign-event.controller';
import { CampaignEventService } from '../campaign-event.service';
import {
  createMockUser,
  createMockCampaign,
} from '../../campaign/test/fixtures/campaign.fixture';
import { createMockCampaignEventService } from './mocks/campaign-event.service.mock';
import { createMockCampaignEventWithEvent } from './fixtures/campaign-event.fixture';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { CampaignGuard } from '../../campaign/guard/campaign.guard';
import { CampaignEventGuard } from '../guard/campaign-event.guard';

describe('CampaignEventController', () => {
  let controller: CampaignEventController;
  let campaignEventService: CampaignEventService;

  const mockUser = createMockUser();
  const mockCampaign = createMockCampaign();
  const mockCampaignEventService = createMockCampaignEventService();

  const mockCampaignEvent = {
    id: 'campaign-event-123',
    isActive: true,
    campaignId: 'campaign-123',
    eventId: 'event-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser;
      return true;
    }),
  };

  const mockCampaignGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.campaign = mockCampaign;
      return true;
    }),
  };

  const mockCampaignEventGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.campaignEvent = mockCampaignEvent;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignEventController],
      providers: [
        { provide: CampaignEventService, useValue: mockCampaignEventService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(CampaignGuard)
      .useValue(mockCampaignGuard)
      .overrideGuard(CampaignEventGuard)
      .useValue(mockCampaignEventGuard)
      .compile();

    controller = module.get(CampaignEventController);
    campaignEventService = module.get(CampaignEventService);

    jest.clearAllMocks();
  });

  describe('getCampaignEventList', () => {
    it('should return paginated campaign event list', async () => {
      const mockResponse = {
        data: [mockCampaignEvent],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest
        .spyOn(campaignEventService, 'getCampaignEventList')
        .mockResolvedValue(mockResponse);

      const result = await controller.getCampaignEventList('campaign-123', {
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(campaignEventService.getCampaignEventList).toHaveBeenCalledWith(
        'campaign-123',
        { limit: 10 },
      );
    });
  });

  describe('getCampaignEvent', () => {
    it('should return campaign event details', async () => {
      const mockEventWithDetails = createMockCampaignEventWithEvent();
      jest
        .spyOn(campaignEventService, 'getCampaignEvent')
        .mockResolvedValue(mockEventWithDetails);

      const result = await controller.getCampaignEvent('campaign-event-123');

      expect(result).toEqual(mockEventWithDetails);
      expect(campaignEventService.getCampaignEvent).toHaveBeenCalledWith(
        'campaign-event-123',
      );
    });
  });

  describe('createCampaignEvent', () => {
    it('should create and return a campaign event', async () => {
      jest
        .spyOn(campaignEventService, 'createCampaignEvent')
        .mockResolvedValue(mockCampaignEvent);

      const result = await controller.createCampaignEvent('campaign-123', {
        eventId: 'event-123',
      });

      expect(result).toEqual(mockCampaignEvent);
      expect(campaignEventService.createCampaignEvent).toHaveBeenCalledWith(
        { eventId: 'event-123' },
        'campaign-123',
      );
    });
  });

  describe('updateCampaignEvent', () => {
    it('should update and return a campaign event', async () => {
      const updatedEvent = { ...mockCampaignEvent, isActive: false };
      jest
        .spyOn(campaignEventService, 'updateCampaignEvent')
        .mockResolvedValue(updatedEvent);

      const result = await controller.updateCampaignEvent(
        { isActive: false },
        mockCampaignEvent,
      );

      expect(result).toEqual(updatedEvent);
      expect(campaignEventService.updateCampaignEvent).toHaveBeenCalledWith(
        { isActive: false },
        mockCampaignEvent,
      );
    });
  });

  describe('deleteCampaignEvent', () => {
    it('should delete and return a campaign event', async () => {
      jest
        .spyOn(campaignEventService, 'deleteCampaignEvent')
        .mockResolvedValue(mockCampaignEvent);

      const result = await controller.deleteCampaignEvent(mockCampaignEvent);

      expect(result).toEqual(mockCampaignEvent);
      expect(campaignEventService.deleteCampaignEvent).toHaveBeenCalledWith(
        mockCampaignEvent,
      );
    });
  });
});
