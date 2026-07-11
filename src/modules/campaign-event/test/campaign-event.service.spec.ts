import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignEventRepository } from '../campaign-event.repository';
import { EventRepository } from '../../event/event.repository';
import {
  createMockCampaignEvent,
  createMockCampaignEventWithEvent,
} from './fixtures/campaign-event.fixture';
import { createMockCampaignEventRepository } from './mocks/campaign-event.repository.mock';
import { createMockEventRepository } from '../../event/test/mocks/event.repository.mock';
import { CampaignEventService } from '../campaign-event.service';
import { createMockEventWithDetails } from '../../event/test/fixtures/event.fixture';

describe('CampaignEventService', () => {
  let service: CampaignEventService;
  let repository: CampaignEventRepository;
  let eventRepository: EventRepository;

  const mockCampaignEvent = createMockCampaignEvent();
  const mockCampaignEventWithEvent = createMockCampaignEventWithEvent();
  const mockRepository = createMockCampaignEventRepository();
  const mockEventRepository = createMockEventRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignEventService,
        { provide: CampaignEventRepository, useValue: mockRepository },
        { provide: EventRepository, useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get(CampaignEventService);
    repository = module.get(CampaignEventRepository);
    eventRepository = module.get(EventRepository);

    jest.clearAllMocks();
  });

  describe('getCampaignEventList', () => {
    it('should return paginated campaign event list', async () => {
      jest
        .spyOn(repository, 'getCampaignEventList')
        .mockResolvedValue([mockCampaignEvent]);

      const result = await service.getCampaignEventList('campaign-123', {
        limit: 10,
      });

      expect(result.data).toEqual([mockCampaignEvent]);
      expect(result.count).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(repository.getCampaignEventList).toHaveBeenCalledWith(
        { campaignId: 'campaign-123' },
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const events = Array.from({ length: 11 }, (_, i) =>
        createMockCampaignEvent({ id: `campaign-event-${i}` }),
      );
      jest.spyOn(repository, 'getCampaignEventList').mockResolvedValue(events);

      const result = await service.getCampaignEventList('campaign-123', {
        limit: 10,
      });

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('getCampaignEvent', () => {
    it('should return campaign event with event details when found', async () => {
      jest
        .spyOn(repository, 'getCampaignEvent')
        .mockResolvedValue(mockCampaignEventWithEvent);

      const result = await service.getCampaignEvent('campaign-event-123');

      expect(result).toEqual(mockCampaignEventWithEvent);
      expect(repository.getCampaignEvent).toHaveBeenCalledWith({
        id: 'campaign-event-123',
      });
    });

    it('should throw NotFoundException when not found', async () => {
      jest.spyOn(repository, 'getCampaignEvent').mockResolvedValue(null);

      await expect(service.getCampaignEvent('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getCampaignEvent('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createCampaignEvent', () => {
    it('should create campaign event when event exists', async () => {
      jest
        .spyOn(eventRepository, 'getEvent')
        .mockResolvedValue(createMockEventWithDetails());
      jest
        .spyOn(repository, 'createCampaignEvent')
        .mockResolvedValue(mockCampaignEvent);

      const result = await service.createCampaignEvent(
        { eventId: 'event-123' },
        'campaign-123',
      );

      expect(result).toEqual(mockCampaignEvent);
      expect(repository.createCampaignEvent).toHaveBeenCalledWith(
        { eventId: 'event-123' },
        'campaign-123',
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      jest.spyOn(eventRepository, 'getEvent').mockResolvedValue(null);

      await expect(
        service.createCampaignEvent({ eventId: 'not-found' }, 'campaign-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCampaignEvent', () => {
    it('should update and return campaign event', async () => {
      const updatedEvent = createMockCampaignEvent({ isActive: false });
      jest
        .spyOn(repository, 'updateCampaignEvent')
        .mockResolvedValue(updatedEvent);

      const result = await service.updateCampaignEvent(
        { isActive: false },
        mockCampaignEvent,
      );

      expect(result).toEqual(updatedEvent);
      expect(repository.updateCampaignEvent).toHaveBeenCalledWith(
        { id: 'campaign-event-123' },
        { isActive: false },
      );
    });
  });

  describe('deleteCampaignEvent', () => {
    it('should delete and return campaign event', async () => {
      jest
        .spyOn(repository, 'deleteCampaignEvent')
        .mockResolvedValue(mockCampaignEvent);

      const result = await service.deleteCampaignEvent(mockCampaignEvent);

      expect(result).toEqual(mockCampaignEvent);
      expect(repository.deleteCampaignEvent).toHaveBeenCalledWith({
        id: 'campaign-event-123',
      });
    });
  });
});
