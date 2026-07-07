import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ThresholdEventService } from '../threshold-event.service';
import { ThresholdEventRepository } from '../threshold-event.repository';
import { EventRepository } from '../../event/event.repository';
import { createMockThresholdEventRepository } from './mocks/threshold-event.repository.mock';
import {
  createMockThresholdEvent,
  createMockThresholdEventWithEvent,
} from './fixtures/threshold-event.fixture';
import { createMockEvent } from '../../event/test/fixtures/event.fixture';
import { ThresholdType } from '../../../generated/prisma/client';

describe('ThresholdEventService', () => {
  let service: ThresholdEventService;
  let repository: ThresholdEventRepository;
  let eventRepository: EventRepository;

  const mockRepository = createMockThresholdEventRepository();
  const mockEventRepository = {
    getEvent: jest.fn().mockResolvedValue(createMockEvent()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThresholdEventService,
        { provide: ThresholdEventRepository, useValue: mockRepository },
        { provide: EventRepository, useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get(ThresholdEventService);
    repository = module.get(ThresholdEventRepository);
    eventRepository = module.get(EventRepository);

    jest.clearAllMocks();
  });

  describe('getThresholdEventList', () => {
    it('should return paginated threshold event list', async () => {
      const mockEvents = [createMockThresholdEvent()];
      mockRepository.getThresholdEventList.mockResolvedValue(mockEvents);

      const result = await service.getThresholdEventList('campaign-123', {
        limit: 10,
      });

      expect(result.data).toEqual(mockEvents);
      expect(result.hasMore).toBe(false);
      expect(repository.getThresholdEventList).toHaveBeenCalledWith(
        { campaignId: 'campaign-123' },
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should filter by thresholdType when provided', async () => {
      mockRepository.getThresholdEventList.mockResolvedValue([]);

      await service.getThresholdEventList('campaign-123', {
        thresholdType: ThresholdType.CHAOS,
        limit: 10,
      });

      expect(repository.getThresholdEventList).toHaveBeenCalledWith(
        { campaignId: 'campaign-123', thresholdType: ThresholdType.CHAOS },
        expect.anything(),
      );
    });
  });

  describe('getThresholdEvent', () => {
    it('should return threshold event with event details', async () => {
      const mockEvent = createMockThresholdEventWithEvent();
      mockRepository.getThresholdEvent.mockResolvedValue(mockEvent);

      const result = await service.getThresholdEvent('threshold-event-123');

      expect(result).toEqual(mockEvent);
      expect(repository.getThresholdEvent).toHaveBeenCalledWith({
        id: 'threshold-event-123',
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.getThresholdEvent.mockResolvedValue(null);

      await expect(service.getThresholdEvent('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getThresholdEvent('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createThresholdEvent', () => {
    it('should create threshold event when event exists', async () => {
      const mockEvent = createMockThresholdEvent();
      mockRepository.createThresholdEvent.mockResolvedValue(mockEvent);
      mockEventRepository.getEvent.mockResolvedValue(createMockEvent());

      const result = await service.createThresholdEvent(
        { thresholdType: ThresholdType.CHAOS, eventId: 'event-123' },
        'campaign-123',
      );

      expect(result).toEqual(mockEvent);
      expect(eventRepository.getEvent).toHaveBeenCalledWith({
        id: 'event-123',
      });
      expect(repository.createThresholdEvent).toHaveBeenCalledWith(
        { thresholdType: ThresholdType.CHAOS, eventId: 'event-123' },
        'campaign-123',
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      mockEventRepository.getEvent.mockResolvedValue(null);

      await expect(
        service.createThresholdEvent(
          { thresholdType: ThresholdType.CHAOS, eventId: 'not-found' },
          'campaign-123',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateThresholdEvent', () => {
    it('should update threshold event', async () => {
      const mockThreshold = createMockThresholdEvent();
      const mockUpdated = createMockThresholdEvent({
        thresholdType: ThresholdType.BLESSING,
      });
      mockRepository.updateThresholdEvent.mockResolvedValue(mockUpdated);

      const result = await service.updateThresholdEvent(
        { thresholdType: ThresholdType.BLESSING },
        mockThreshold,
      );

      expect(result).toEqual(mockUpdated);
      expect(repository.updateThresholdEvent).toHaveBeenCalledWith(
        { id: mockThreshold.id },
        { thresholdType: ThresholdType.BLESSING },
      );
    });

    it('should validate new event when eventId is provided', async () => {
      const mockThreshold = createMockThresholdEvent();
      mockEventRepository.getEvent.mockResolvedValue(createMockEvent());
      mockRepository.updateThresholdEvent.mockResolvedValue(mockThreshold);

      await service.updateThresholdEvent(
        { eventId: 'event-456' },
        mockThreshold,
      );

      expect(eventRepository.getEvent).toHaveBeenCalledWith({
        id: 'event-456',
      });
    });

    it('should throw NotFoundException when new event not found', async () => {
      const mockThreshold = createMockThresholdEvent();
      mockEventRepository.getEvent.mockResolvedValue(null);

      await expect(
        service.updateThresholdEvent({ eventId: 'not-found' }, mockThreshold),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteThresholdEvent', () => {
    it('should delete and return threshold event', async () => {
      const mockThreshold = createMockThresholdEvent();
      mockRepository.deleteThresholdEvent.mockResolvedValue(mockThreshold);

      const result = await service.deleteThresholdEvent(mockThreshold);

      expect(result).toEqual(mockThreshold);
      expect(repository.deleteThresholdEvent).toHaveBeenCalledWith({
        id: mockThreshold.id,
      });
    });
  });
});
