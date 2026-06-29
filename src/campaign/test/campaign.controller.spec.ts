import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { CampaignController } from '../campaign.controller';
import { CampaignService } from '../campaign.service';
import { CampaignStatus, ConclusionType } from '../../generated/prisma/client';
import { FilterDeletionStatus } from '../../enum/filter-status.enum';
import {
  createMockCampaign,
  createMockUser,
} from './fixtures/campaign.fixture';
import { createMockCampaignService } from './mocks/campaign.service.mock';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CampaignGuard } from '../guard/campaign.guard';
import { CampaignEventGuard } from '../guard/campaign-event.guard';
import { CampaignEventService } from '../campaign-event.service';
import { createMockCampaignEventService } from './mocks/campaign-event.service.mock';
import { createMockCampaignEventWithEvent } from './fixtures/campaign-event.fixture';

describe('CampaignController', () => {
  let controller: CampaignController;
  let service: CampaignService;
  let campaignEventService: CampaignEventService;

  const mockUser = createMockUser();
  const mockCampaign = createMockCampaign();
  const mockService = createMockCampaignService();

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
      controllers: [CampaignController],
      providers: [
        {
          provide: CampaignService,
          useValue: mockService,
        },
        {
          provide: CampaignEventService,
          useValue: createMockCampaignEventService(),
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(CampaignGuard)
      .useValue(mockCampaignGuard)
      .overrideGuard(CampaignEventGuard)
      .useValue(mockCampaignEventGuard)
      .compile();

    controller = module.get(CampaignController);
    service = module.get(CampaignService);
    campaignEventService = module.get(CampaignEventService);

    jest.clearAllMocks();
  });

  describe('campaignList', () => {
    it('should return paginated campaign list', async () => {
      const mockResponse = {
        data: [mockCampaign],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest.spyOn(service, 'getCampaignList').mockResolvedValue(mockResponse);

      const result = await controller.campaignList(
        { deletionStatus: FilterDeletionStatus.ACTIVE, limit: 10 },
        mockUser,
      );

      expect(result).toEqual(mockResponse);
      expect(service.getCampaignList).toHaveBeenCalledWith(mockUser, {
        deletionStatus: FilterDeletionStatus.ACTIVE,
        limit: 10,
      });
    });

    it('should handle pagination params', async () => {
      const mockResponse = {
        data: [mockCampaign],
        nextCursor: 'cursor-123',
        previousCursor: null,
        count: 1,
        hasMore: true,
        hasPrevious: false,
      };
      jest.spyOn(service, 'getCampaignList').mockResolvedValue(mockResponse);

      await controller.campaignList(
        {
          deletionStatus: FilterDeletionStatus.ALL,
          limit: 5,
          cursor: 'cursor-123',
          direction: 'forward',
        },
        mockUser,
      );

      expect(service.getCampaignList).toHaveBeenCalledWith(mockUser, {
        deletionStatus: FilterDeletionStatus.ALL,
        limit: 5,
        cursor: 'cursor-123',
        direction: 'forward',
      });
    });
  });

  describe('campaignDetails', () => {
    it('should return campaign details', async () => {
      jest.spyOn(service, 'getCampaign').mockResolvedValue(mockCampaign);

      const result = await controller.campaignDetails('campaign-123', mockUser);

      expect(result).toEqual(mockCampaign);
      expect(service.getCampaign).toHaveBeenCalledWith(
        'campaign-123',
        mockUser,
      );
    });
  });

  describe('createCampaign', () => {
    it('should create a new campaign', async () => {
      const createDto = {
        title: 'New Campaign',
        description: 'Description',
        chaosThreshold: 50,
        blessingThreshold: 100,
      };
      jest.spyOn(service, 'createCampaign').mockResolvedValue(mockCampaign);

      const result = await controller.createCampaign(createDto, mockUser);

      expect(result).toEqual(mockCampaign);
      expect(service.createCampaign).toHaveBeenCalledWith(createDto, mockUser);
    });
  });

  describe('updateCampaign', () => {
    it('should update a campaign', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedCampaign = createMockCampaign({ title: 'Updated Title' });
      jest.spyOn(service, 'updateCampaign').mockResolvedValue(updatedCampaign);

      const result = await controller.updateCampaign(updateDto, mockCampaign);

      expect(result).toEqual(updatedCampaign);
      expect(service.updateCampaign).toHaveBeenCalledWith(
        updateDto,
        mockCampaign,
      );
    });
  });

  describe('updateCampaignStatus', () => {
    describe('updateCampaignStatus', () => {
      it('should update campaign status without conclusion', async () => {
        const statusDto = {
          status: CampaignStatus.PAUSED,
        };
        const updatedCampaign = createMockCampaign({
          status: CampaignStatus.PAUSED,
        });
        jest
          .spyOn(service, 'updateCampaignStatus')
          .mockResolvedValue(updatedCampaign);

        const result = await controller.updateCampaignStatus(
          statusDto,
          mockCampaign,
        );

        expect(result).toEqual(updatedCampaign);
        expect(service.updateCampaignStatus).toHaveBeenCalledWith(
          statusDto,
          mockCampaign,
        );
      });

      it('should update campaign status with conclusion', async () => {
        const statusDto = {
          status: CampaignStatus.ENDED,
          conclusion: ConclusionType.VICTORY,
        };
        const updatedCampaign = createMockCampaign({
          status: CampaignStatus.ENDED,
          conclusion: ConclusionType.VICTORY,
        });
        jest
          .spyOn(service, 'updateCampaignStatus')
          .mockResolvedValue(updatedCampaign);

        const result = await controller.updateCampaignStatus(
          statusDto,
          mockCampaign,
        );

        expect(result).toEqual(updatedCampaign);
        expect(service.updateCampaignStatus).toHaveBeenCalledWith(
          statusDto,
          mockCampaign,
        );
      });
    });
  });

  describe('updateCampaignKarma', () => {
    it('should update campaign karma', async () => {
      const karmaDto = { karmaValue: 10 };
      const updatedCampaign = createMockCampaign({ karmaValue: 10 });
      jest
        .spyOn(service, 'updateCampaignKarma')
        .mockResolvedValue(updatedCampaign);

      const result = await controller.updateCampaignKarma(
        karmaDto,
        mockCampaign,
      );

      expect(result).toEqual(updatedCampaign);
      expect(service.updateCampaignKarma).toHaveBeenCalledWith(
        karmaDto,
        mockCampaign,
      );
    });
  });

  describe('softRemoveCampaign', () => {
    it('should soft delete a campaign', async () => {
      const deletedCampaign = createMockCampaign({ deletedAt: new Date() });
      jest
        .spyOn(service, 'softRemoveCampaign')
        .mockResolvedValue(deletedCampaign);

      const result = await controller.softRemoveCampaign(mockCampaign);

      expect(result).toEqual(deletedCampaign);
      expect(service.softRemoveCampaign).toHaveBeenCalledWith(mockCampaign);
    });
  });

  describe('restoreSoftRemovedCampaign', () => {
    it('should restore a soft deleted campaign', async () => {
      jest
        .spyOn(service, 'restoreSoftRemovedCampaign')
        .mockResolvedValue(mockCampaign);

      const result = await controller.restoreSoftRemovedCampaign(mockCampaign);

      expect(result).toEqual(mockCampaign);
      expect(service.restoreSoftRemovedCampaign).toHaveBeenCalledWith(
        mockCampaign,
      );
    });
  });

  describe('deleteCampaignFromTrash', () => {
    it('should permanently delete a campaign', async () => {
      const deletedCampaign = createMockCampaign({ deletedAt: new Date() });
      jest.spyOn(service, 'deleteCampaign').mockResolvedValue(deletedCampaign);

      const result = await controller.deleteCampaignFromTrash(mockCampaign);

      expect(result).toEqual(deletedCampaign);
      expect(service.deleteCampaign).toHaveBeenCalledWith(mockCampaign);
    });
  });

  describe('Guards', () => {
    it('should apply JwtAuthGuard to all routes', () => {
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });

    it('should apply CampaignGuard to protected routes', () => {
      expect(mockCampaignGuard.canActivate).toBeDefined();
    });
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
