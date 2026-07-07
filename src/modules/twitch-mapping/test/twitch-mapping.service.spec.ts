import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TwitchMappingService } from '../twitch-mapping.service';
import { TwitchMappingRepository } from '../twitch-mapping.repository';
import { EventRepository } from '../../../modules/event/event.repository';
import { createMockTwitchMappingRepository } from './mocks/twitch-mapping.repository.mock';
import {
  createMockTwitchMapping,
  createMockTwitchMappingWithEvent,
} from './fixtures/twitch-mapping.fixture';
import { createMockEvent } from '../../../modules/event/test/fixtures/event.fixture';
import { TriggerType } from '../../../generated/prisma/client';

describe('TwitchMappingService', () => {
  let service: TwitchMappingService;
  let repository: TwitchMappingRepository;
  let eventRepository: EventRepository;

  const mockRepository = createMockTwitchMappingRepository();
  const mockEventRepository = {
    getEvent: jest.fn().mockResolvedValue(createMockEvent()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitchMappingService,
        { provide: TwitchMappingRepository, useValue: mockRepository },
        { provide: EventRepository, useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get(TwitchMappingService);
    repository = module.get(TwitchMappingRepository);
    eventRepository = module.get(EventRepository);

    jest.clearAllMocks();
  });

  describe('getTwitchMappingList', () => {
    it('should return paginated twitch mapping list', async () => {
      const mockMappings = [createMockTwitchMapping()];
      mockRepository.getTwitchMappingList.mockResolvedValue(mockMappings);

      const result = await service.getTwitchMappingList('campaign-123', {
        limit: 10,
      });

      expect(result.data).toEqual(mockMappings);
      expect(result.hasMore).toBe(false);
      expect(repository.getTwitchMappingList).toHaveBeenCalledWith(
        { campaignId: 'campaign-123' },
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should filter by twitchEventType when provided', async () => {
      mockRepository.getTwitchMappingList.mockResolvedValue([]);

      await service.getTwitchMappingList('campaign-123', {
        twitchEventType: TriggerType.SUB_TIER1,
        limit: 10,
      });

      expect(repository.getTwitchMappingList).toHaveBeenCalledWith(
        { campaignId: 'campaign-123', twitchEventType: TriggerType.SUB_TIER1 },
        expect.anything(),
      );
    });

    it('should filter by isActive when provided', async () => {
      mockRepository.getTwitchMappingList.mockResolvedValue([]);

      await service.getTwitchMappingList('campaign-123', {
        isActive: true,
        limit: 10,
      });

      expect(repository.getTwitchMappingList).toHaveBeenCalledWith(
        { campaignId: 'campaign-123', isActive: true },
        expect.anything(),
      );
    });
  });

  describe('getTwitchMapping', () => {
    it('should return twitch mapping with event details', async () => {
      const mockMapping = createMockTwitchMappingWithEvent();
      mockRepository.getTwitchMapping.mockResolvedValue(mockMapping);

      const result = await service.getTwitchMapping('twitch-mapping-123');

      expect(result).toEqual(mockMapping);
      expect(repository.getTwitchMapping).toHaveBeenCalledWith({
        id: 'twitch-mapping-123',
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.getTwitchMapping.mockResolvedValue(null);

      await expect(service.getTwitchMapping('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getTwitchMapping('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createTwitchMapping', () => {
    it('should create twitch mapping when event exists', async () => {
      const mockMapping = createMockTwitchMapping();
      mockRepository.createTwitchMapping.mockResolvedValue(mockMapping);
      mockEventRepository.getEvent.mockResolvedValue(createMockEvent());

      const result = await service.createTwitchMapping(
        { twitchEventType: TriggerType.SUB_TIER1, eventId: 'event-123' },
        'campaign-123',
      );

      expect(result).toEqual(mockMapping);
      expect(eventRepository.getEvent).toHaveBeenCalledWith({
        id: 'event-123',
      });
      expect(repository.createTwitchMapping).toHaveBeenCalledWith(
        { twitchEventType: TriggerType.SUB_TIER1, eventId: 'event-123' },
        'campaign-123',
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      mockEventRepository.getEvent.mockResolvedValue(null);

      await expect(
        service.createTwitchMapping(
          { twitchEventType: TriggerType.SUB_TIER1, eventId: 'not-found' },
          'campaign-123',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTwitchMapping', () => {
    it('should update twitch mapping', async () => {
      const mockMapping = createMockTwitchMapping();
      const mockUpdated = createMockTwitchMapping({ isActive: false });
      mockRepository.updateTwitchMapping.mockResolvedValue(mockUpdated);

      const result = await service.updateTwitchMapping(
        { isActive: false },
        mockMapping,
      );

      expect(result).toEqual(mockUpdated);
      expect(repository.updateTwitchMapping).toHaveBeenCalledWith(
        { id: mockMapping.id },
        { isActive: false },
      );
    });

    it('should validate new event when eventId is provided', async () => {
      const mockMapping = createMockTwitchMapping();
      mockEventRepository.getEvent.mockResolvedValue(createMockEvent());
      mockRepository.updateTwitchMapping.mockResolvedValue(mockMapping);

      await service.updateTwitchMapping({ eventId: 'event-456' }, mockMapping);

      expect(eventRepository.getEvent).toHaveBeenCalledWith({
        id: 'event-456',
      });
    });

    it('should throw NotFoundException when new event not found', async () => {
      const mockMapping = createMockTwitchMapping();
      mockEventRepository.getEvent.mockResolvedValue(null);

      await expect(
        service.updateTwitchMapping({ eventId: 'not-found' }, mockMapping),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTwitchMapping', () => {
    it('should delete and return twitch mapping', async () => {
      const mockMapping = createMockTwitchMapping();
      mockRepository.deleteTwitchMapping.mockResolvedValue(mockMapping);

      const result = await service.deleteTwitchMapping(mockMapping);

      expect(result).toEqual(mockMapping);
      expect(repository.deleteTwitchMapping).toHaveBeenCalledWith({
        id: mockMapping.id,
      });
    });
  });
});
