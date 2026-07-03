import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { KarmaEventController } from '../karma-event.controller';
import { KarmaEventService } from '../karma-event.service';
import { ThresholdEventService } from '../threshold-event.service';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CampaignGuard } from '../guard/campaign.guard';
import { ThresholdEventGuard } from '../guard/threshold-event.guard';
import { createMockKarmaEvent } from './fixtures/karma-event.fixture';
import {
  createMockThresholdEvent,
  createMockThresholdEventWithEvent,
} from './fixtures/threshold-event.fixture';
import { ThresholdType } from '../../generated/prisma/client';

describe('KarmaEventController', () => {
  let controller: KarmaEventController;
  let karmaService: KarmaEventService;
  let thresholdService: ThresholdEventService;

  const mockKarmaEvent = createMockKarmaEvent();
  const mockThresholdEvent = createMockThresholdEvent();
  const mockThresholdEventWithEvent = createMockThresholdEventWithEvent();

  const mockKarmaService = {
    getKarmaEventList: jest.fn(),
    getKarmaEvent: jest.fn(),
  };

  const mockThresholdService = {
    getThresholdEventList: jest.fn(),
    getThresholdEvent: jest.fn(),
    createThresholdEvent: jest.fn(),
    updateThresholdEvent: jest.fn(),
    deleteThresholdEvent: jest.fn(),
  };

  const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

  const mockThresholdEventGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.thresholdEvent = mockThresholdEvent;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KarmaEventController],
      providers: [
        { provide: KarmaEventService, useValue: mockKarmaService },
        { provide: ThresholdEventService, useValue: mockThresholdService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(CampaignGuard)
      .useValue(mockGuard)
      .overrideGuard(ThresholdEventGuard)
      .useValue(mockThresholdEventGuard)
      .compile();

    controller = module.get(KarmaEventController);
    karmaService = module.get(KarmaEventService);
    thresholdService = module.get(ThresholdEventService);

    jest.clearAllMocks();
  });

  describe('getKarmaEventList', () => {
    it('should return paginated karma event list', async () => {
      const mockResponse = {
        data: [mockKarmaEvent],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest
        .spyOn(karmaService, 'getKarmaEventList')
        .mockResolvedValue(mockResponse);

      const result = await controller.getKarmaEventList('campaign-123', {
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(karmaService.getKarmaEventList).toHaveBeenCalledWith(
        'campaign-123',
        { limit: 10 },
      );
    });
  });

  describe('getKarmaEvent', () => {
    it('should return karma event details', async () => {
      jest
        .spyOn(karmaService, 'getKarmaEvent')
        .mockResolvedValue(mockKarmaEvent);

      const result = await controller.getKarmaEvent('karma-event-123');

      expect(result).toEqual(mockKarmaEvent);
      expect(karmaService.getKarmaEvent).toHaveBeenCalledWith(
        'karma-event-123',
      );
    });
  });

  describe('getThresholdEventList', () => {
    it('should return paginated threshold event list', async () => {
      const mockResponse = {
        data: [mockThresholdEvent],
        nextCursor: null,
        previousCursor: null,
        count: 1,
        hasMore: false,
        hasPrevious: false,
      };
      jest
        .spyOn(thresholdService, 'getThresholdEventList')
        .mockResolvedValue(mockResponse);

      const result = await controller.getThresholdEventList('campaign-123', {
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(thresholdService.getThresholdEventList).toHaveBeenCalledWith(
        'campaign-123',
        { limit: 10 },
      );
    });
  });

  describe('getThresholdEvent', () => {
    it('should return threshold event details', async () => {
      jest
        .spyOn(thresholdService, 'getThresholdEvent')
        .mockResolvedValue(mockThresholdEventWithEvent);

      const result = await controller.getThresholdEvent('threshold-event-123');

      expect(result).toEqual(mockThresholdEventWithEvent);
      expect(thresholdService.getThresholdEvent).toHaveBeenCalledWith(
        'threshold-event-123',
      );
    });
  });

  describe('createThresholdEvent', () => {
    it('should create and return threshold event', async () => {
      jest
        .spyOn(thresholdService, 'createThresholdEvent')
        .mockResolvedValue(mockThresholdEvent);

      const result = await controller.createThresholdEvent('campaign-123', {
        thresholdType: ThresholdType.CHAOS,
        eventId: 'event-123',
      });

      expect(result).toEqual(mockThresholdEvent);
      expect(thresholdService.createThresholdEvent).toHaveBeenCalledWith(
        { thresholdType: ThresholdType.CHAOS, eventId: 'event-123' },
        'campaign-123',
      );
    });
  });

  describe('updateThresholdEvent', () => {
    it('should update and return threshold event', async () => {
      const updated = createMockThresholdEvent({
        thresholdType: ThresholdType.BLESSING,
      });
      jest
        .spyOn(thresholdService, 'updateThresholdEvent')
        .mockResolvedValue(updated);

      const result = await controller.updateThresholdEvent(
        { thresholdType: ThresholdType.BLESSING },
        mockThresholdEvent,
      );

      expect(result).toEqual(updated);
      expect(thresholdService.updateThresholdEvent).toHaveBeenCalledWith(
        { thresholdType: ThresholdType.BLESSING },
        mockThresholdEvent,
      );
    });
  });

  describe('deleteThresholdEvent', () => {
    it('should delete and return threshold event', async () => {
      jest
        .spyOn(thresholdService, 'deleteThresholdEvent')
        .mockResolvedValue(mockThresholdEvent);

      const result = await controller.deleteThresholdEvent(mockThresholdEvent);

      expect(result).toEqual(mockThresholdEvent);
      expect(thresholdService.deleteThresholdEvent).toHaveBeenCalledWith(
        mockThresholdEvent,
      );
    });
  });
});
