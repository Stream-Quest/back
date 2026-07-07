import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { KarmaEventService } from '../../karma-event/karma-event.service';
import { KarmaEventRepository } from '../../karma-event/karma-event.repository';
import { ThresholdEventRepository } from '../../threshold-event/threshold-event.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../redis/redis.service';
import { createMockKarmaEventRepository } from './mocks/karma-event.repository.mock';
import { createMockKarmaEvent } from '../../karma-event/test/fixtures/karma-event.fixture';
import { createMockThresholdEventWithEvent } from '../../threshold-event/test/fixtures/threshold-event.fixture';
import { ThresholdType } from '../../../generated/prisma/client';
import { createMockThresholdEventRepository } from '../../threshold-event/test/mocks/threshold-event.repository.mock';

describe('KarmaEventService', () => {
  let service: KarmaEventService;
  let karmaRepository: KarmaEventRepository;
  let thresholdRepository: ThresholdEventRepository;

  const mockKarmaRepository = createMockKarmaEventRepository();
  const mockThresholdRepository = createMockThresholdEventRepository();

  const mockPrisma = {
    sessionEvent: {
      create: jest.fn().mockResolvedValue({
        id: 'session-event-123',
        eventId: 'event-123',
        triggeredAt: new Date('2024-01-01'),
      }),
    },
  };

  const mockRedisService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KarmaEventService,
        { provide: KarmaEventRepository, useValue: mockKarmaRepository },
        {
          provide: ThresholdEventRepository,
          useValue: mockThresholdRepository,
        },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get(KarmaEventService);
    karmaRepository = module.get(KarmaEventRepository);
    thresholdRepository = module.get(ThresholdEventRepository);

    jest.clearAllMocks();
  });

  describe('getKarmaEventList', () => {
    it('should return paginated karma event list', async () => {
      const mockEvents = [createMockKarmaEvent()];
      mockKarmaRepository.getKarmaEventList.mockResolvedValue(mockEvents);

      const result = await service.getKarmaEventList('campaign-123', {
        limit: 10,
      });

      expect(result.data).toEqual(mockEvents);
      expect(result.hasMore).toBe(false);
      expect(karmaRepository.getKarmaEventList).toHaveBeenCalledWith(
        { campaignId: 'campaign-123' },
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should filter by sessionId when provided', async () => {
      mockKarmaRepository.getKarmaEventList.mockResolvedValue([]);

      await service.getKarmaEventList('campaign-123', {
        sessionId: 'session-123',
        limit: 10,
      });

      expect(karmaRepository.getKarmaEventList).toHaveBeenCalledWith(
        { campaignId: 'campaign-123', sessionId: 'session-123' },
        expect.anything(),
      );
    });
  });

  describe('getKarmaEvent', () => {
    it('should return karma event when found', async () => {
      const mockEvent = createMockKarmaEvent();
      mockKarmaRepository.getKarmaEvent.mockResolvedValue(mockEvent);

      const result = await service.getKarmaEvent('karma-event-123');

      expect(result).toEqual(mockEvent);
      expect(karmaRepository.getKarmaEvent).toHaveBeenCalledWith({
        id: 'karma-event-123',
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockKarmaRepository.getKarmaEvent.mockResolvedValue(null);

      await expect(service.getKarmaEvent('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('applyKarma', () => {
    it('should create karma event and increment campaign karma', async () => {
      const mockEvent = createMockKarmaEvent();
      mockKarmaRepository.createKarmaEvent.mockResolvedValue(mockEvent);
      mockKarmaRepository.incrementCampaignKarma.mockResolvedValue({
        karmaValue: -10,
        chaosThreshold: -50,
        blessingThreshold: 50,
      });

      const result = await service.applyKarma({
        campaignId: 'campaign-123',
        value: -10,
        reason: 'Wolf Ambush',
      });

      expect(result.karmaEvent).toEqual(mockEvent);
      expect(result.newKarmaValue).toBe(-10);
      expect(karmaRepository.createKarmaEvent).toHaveBeenCalledWith({
        value: -10,
        reason: 'Wolf Ambush',
        campaignId: 'campaign-123',
        sessionId: undefined,
      });
    });

    it('should publish redis event after karma update', async () => {
      const mockEvent = createMockKarmaEvent();
      mockKarmaRepository.createKarmaEvent.mockResolvedValue(mockEvent);
      mockKarmaRepository.incrementCampaignKarma.mockResolvedValue({
        karmaValue: -10,
        chaosThreshold: -50,
        blessingThreshold: 50,
      });

      await service.applyKarma({
        campaignId: 'campaign-123',
        value: -10,
        reason: 'Wolf Ambush',
      });

      expect(mockRedisService.publish).toHaveBeenCalledWith(
        'campaign:campaign-123:karma-updated',
        expect.objectContaining({ value: -10, newKarmaValue: -10 }),
      );
    });

    it('should not check thresholds when no sessionId provided', async () => {
      mockKarmaRepository.createKarmaEvent.mockResolvedValue(
        createMockKarmaEvent(),
      );
      mockKarmaRepository.incrementCampaignKarma.mockResolvedValue({
        karmaValue: -100,
        chaosThreshold: -50,
        blessingThreshold: 50,
      });

      await service.applyKarma({
        campaignId: 'campaign-123',
        value: -100,
        reason: 'Test',
      });

      expect(
        thresholdRepository.getThresholdEventsByType,
      ).not.toHaveBeenCalled();
    });

    it('should check thresholds when sessionId is provided and threshold crossed', async () => {
      mockKarmaRepository.createKarmaEvent.mockResolvedValue(
        createMockKarmaEvent(),
      );
      mockKarmaRepository.incrementCampaignKarma.mockResolvedValue({
        karmaValue: -60,
        chaosThreshold: -50,
        blessingThreshold: 50,
      });
      mockThresholdRepository.getThresholdEventsByType.mockResolvedValue([
        createMockThresholdEventWithEvent(),
      ]);

      await service.applyKarma({
        campaignId: 'campaign-123',
        value: -60,
        reason: 'Test',
        sessionId: 'session-123',
      });

      expect(thresholdRepository.getThresholdEventsByType).toHaveBeenCalledWith(
        'campaign-123',
        ThresholdType.CHAOS,
      );
      expect(mockPrisma.sessionEvent.create).toHaveBeenCalled();
      expect(mockRedisService.publish).toHaveBeenCalledWith(
        'session:session-123:event:pending',
        expect.objectContaining({ thresholdType: ThresholdType.CHAOS }),
      );
    });

    it('should not create session event when threshold not crossed', async () => {
      mockKarmaRepository.createKarmaEvent.mockResolvedValue(
        createMockKarmaEvent(),
      );
      mockKarmaRepository.incrementCampaignKarma.mockResolvedValue({
        karmaValue: -10,
        chaosThreshold: -50,
        blessingThreshold: 50,
      });

      await service.applyKarma({
        campaignId: 'campaign-123',
        value: -10,
        reason: 'Test',
        sessionId: 'session-123',
      });

      expect(
        thresholdRepository.getThresholdEventsByType,
      ).not.toHaveBeenCalled();
      expect(mockPrisma.sessionEvent.create).not.toHaveBeenCalled();
    });
  });
});
