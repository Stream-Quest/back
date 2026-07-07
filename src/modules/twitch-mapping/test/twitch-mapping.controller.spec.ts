import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { TwitchMappingController } from '../twitch-mapping.controller';
import { TwitchMappingService } from '../twitch-mapping.service';
import { JwtAuthGuard } from '../../../auth/guard/jwt-auth.guard';
import { CampaignGuard } from '../../../modules/campaign/guard/campaign.guard';
import { TwitchMappingGuard } from '../guard/twitch-mapping.guard';
import {
  createMockTwitchMapping,
  createMockTwitchMappingWithEvent,
} from './fixtures/twitch-mapping.fixture';
import { TriggerType } from '../../../generated/prisma/client';

describe('TwitchMappingController', () => {
  let controller: TwitchMappingController;
  let service: TwitchMappingService;

  const mockMapping = createMockTwitchMapping();
  const mockMappingWithEvent = createMockTwitchMappingWithEvent();

  const mockService = {
    getTwitchMappingList: jest.fn(),
    getTwitchMapping: jest.fn(),
    createTwitchMapping: jest.fn(),
    updateTwitchMapping: jest.fn(),
    deleteTwitchMapping: jest.fn(),
  };

  const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

  const mockTwitchMappingGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.twitchMapping = mockMapping;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwitchMappingController],
      providers: [{ provide: TwitchMappingService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(CampaignGuard)
      .useValue(mockGuard)
      .overrideGuard(TwitchMappingGuard)
      .useValue(mockTwitchMappingGuard)
      .compile();

    controller = module.get(TwitchMappingController);
    service = module.get(TwitchMappingService);

    jest.clearAllMocks();
  });

  describe('getTwitchMappingList', () => {
    it('should return paginated twitch mapping list', async () => {
      const mockResponse = {
        data: [mockMapping],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest
        .spyOn(service, 'getTwitchMappingList')
        .mockResolvedValue(mockResponse);

      const result = await controller.getTwitchMappingList('campaign-123', {
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(service.getTwitchMappingList).toHaveBeenCalledWith(
        'campaign-123',
        { limit: 10 },
      );
    });
  });

  describe('getTwitchMapping', () => {
    it('should return twitch mapping details', async () => {
      jest
        .spyOn(service, 'getTwitchMapping')
        .mockResolvedValue(mockMappingWithEvent);

      const result = await controller.getTwitchMapping('twitch-mapping-123');

      expect(result).toEqual(mockMappingWithEvent);
      expect(service.getTwitchMapping).toHaveBeenCalledWith(
        'twitch-mapping-123',
      );
    });
  });

  describe('createTwitchMapping', () => {
    it('should create and return twitch mapping', async () => {
      jest.spyOn(service, 'createTwitchMapping').mockResolvedValue(mockMapping);

      const result = await controller.createTwitchMapping('campaign-123', {
        twitchEventType: TriggerType.SUB_TIER1,
        eventId: 'event-123',
      });

      expect(result).toEqual(mockMapping);
      expect(service.createTwitchMapping).toHaveBeenCalledWith(
        { twitchEventType: TriggerType.SUB_TIER1, eventId: 'event-123' },
        'campaign-123',
      );
    });
  });

  describe('updateTwitchMapping', () => {
    it('should update and return twitch mapping', async () => {
      const updated = createMockTwitchMapping({ isActive: false });
      jest.spyOn(service, 'updateTwitchMapping').mockResolvedValue(updated);

      const result = await controller.updateTwitchMapping(
        { isActive: false },
        mockMapping,
      );

      expect(result).toEqual(updated);
      expect(service.updateTwitchMapping).toHaveBeenCalledWith(
        { isActive: false },
        mockMapping,
      );
    });
  });

  describe('deleteTwitchMapping', () => {
    it('should delete and return twitch mapping', async () => {
      jest.spyOn(service, 'deleteTwitchMapping').mockResolvedValue(mockMapping);

      const result = await controller.deleteTwitchMapping(mockMapping);

      expect(result).toEqual(mockMapping);
      expect(service.deleteTwitchMapping).toHaveBeenCalledWith(mockMapping);
    });
  });
});
