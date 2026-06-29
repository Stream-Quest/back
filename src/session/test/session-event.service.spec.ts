import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SessionEventService } from '../session-event.service';
import { SessionEventRepository } from '../session-event.repository';
import { EventRepository } from '../../event/event.repository';
import { RedisService } from '../../redis/redis.service';
import { SessionEventStatus } from '../../generated/prisma/client';
import {
  createMockSessionEvent,
  createMockSessionEventWithDetails,
} from './fixtures/session-event.fixture';
import { createMockSessionEventRepository } from './mocks/session-event.repository.mock';
import { createMockEventRepository } from '../../event/test/mocks/event.repository.mock';
import { createMockRedisService } from './mocks/session.service.mock';
import { createMockEventWithDetails } from '../../event/test/fixtures/event.fixture';

describe('SessionEventService', () => {
  let service: SessionEventService;
  let repository: SessionEventRepository;
  let eventRepository: EventRepository;
  let redisService: RedisService;

  const mockSessionEvent = createMockSessionEvent();
  const mockSessionEventWithDetails = createMockSessionEventWithDetails();
  const mockRepository = createMockSessionEventRepository();
  const mockEventRepository = createMockEventRepository();
  const mockRedisService = createMockRedisService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionEventService,
        { provide: SessionEventRepository, useValue: mockRepository },
        { provide: EventRepository, useValue: mockEventRepository },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get(SessionEventService);
    repository = module.get(SessionEventRepository);
    eventRepository = module.get(EventRepository);
    redisService = module.get(RedisService);

    jest.clearAllMocks();
  });

  describe('getSessionEventList', () => {
    it('should return paginated session event list', async () => {
      jest
        .spyOn(repository, 'getSessionEventList')
        .mockResolvedValue([mockSessionEvent]);

      const result = await service.getSessionEventList('session-123', {
        limit: 10,
      });

      expect(result.data).toEqual([mockSessionEvent]);
      expect(result.count).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(repository.getSessionEventList).toHaveBeenCalledWith(
        { sessionId: 'session-123' },
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should filter by status when provided', async () => {
      jest
        .spyOn(repository, 'getSessionEventList')
        .mockResolvedValue([mockSessionEvent]);

      await service.getSessionEventList('session-123', {
        limit: 10,
        status: SessionEventStatus.PENDING,
      });

      expect(repository.getSessionEventList).toHaveBeenCalledWith(
        { sessionId: 'session-123', status: SessionEventStatus.PENDING },
        expect.any(Object),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const events = Array.from({ length: 11 }, (_, i) =>
        createMockSessionEvent({ id: `session-event-${i}` }),
      );
      jest.spyOn(repository, 'getSessionEventList').mockResolvedValue(events);

      const result = await service.getSessionEventList('session-123', {
        limit: 10,
      });

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('getSessionEvent', () => {
    it('should return session event with details when found', async () => {
      jest
        .spyOn(repository, 'getSessionEvent')
        .mockResolvedValue(mockSessionEventWithDetails);

      const result = await service.getSessionEvent('session-event-123');

      expect(result).toBeDefined();
      expect(repository.getSessionEvent).toHaveBeenCalledWith({
        id: 'session-event-123',
      });
    });

    it('should throw NotFoundException when not found', async () => {
      jest.spyOn(repository, 'getSessionEvent').mockResolvedValue(null);

      await expect(service.getSessionEvent('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getSessionEvent('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createSessionEvent', () => {
    it('should create session event and publish to Redis when event exists', async () => {
      jest
        .spyOn(eventRepository, 'getEvent')
        .mockResolvedValue(createMockEventWithDetails());
      jest
        .spyOn(repository, 'createSessionEvent')
        .mockResolvedValue(mockSessionEvent);
      jest.spyOn(redisService, 'publish').mockResolvedValue();

      const result = await service.createSessionEvent(
        { eventId: 'event-123' },
        'session-123',
      );

      expect(result).toEqual(mockSessionEvent);
      expect(repository.createSessionEvent).toHaveBeenCalledWith(
        { eventId: 'event-123' },
        'session-123',
      );
      expect(redisService.publish).toHaveBeenCalledWith(
        'session:session-123:event:pending',
        expect.objectContaining({
          sessionEventId: mockSessionEvent.id,
          eventId: mockSessionEvent.eventId,
        }),
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      jest.spyOn(eventRepository, 'getEvent').mockResolvedValue(null);

      await expect(
        service.createSessionEvent({ eventId: 'not-found' }, 'session-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSessionEvent', () => {
    it('should update and return session event', async () => {
      const updatedEvent = createMockSessionEvent({
        finalMessage: 'Custom message',
      });
      jest
        .spyOn(repository, 'updateSessionEvent')
        .mockResolvedValue(updatedEvent);

      const result = await service.updateSessionEvent(
        { finalMessage: 'Custom message' },
        mockSessionEvent,
      );

      expect(result).toEqual(updatedEvent);
      expect(repository.updateSessionEvent).toHaveBeenCalledWith(
        { id: 'session-event-123' },
        { finalMessage: 'Custom message' },
      );
    });

    it('should validate new event when eventId is provided', async () => {
      jest
        .spyOn(eventRepository, 'getEvent')
        .mockResolvedValue(createMockEventWithDetails());
      jest
        .spyOn(repository, 'updateSessionEvent')
        .mockResolvedValue(mockSessionEvent);

      await service.updateSessionEvent(
        { eventId: 'new-event-123' },
        mockSessionEvent,
      );

      expect(eventRepository.getEvent).toHaveBeenCalledWith({
        id: 'new-event-123',
      });
    });

    it('should throw NotFoundException when new event not found', async () => {
      jest.spyOn(eventRepository, 'getEvent').mockResolvedValue(null);

      await expect(
        service.updateSessionEvent({ eventId: 'not-found' }, mockSessionEvent),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateSessionEvent', () => {
    it('should validate and publish to Redis', async () => {
      const validatedEvent = createMockSessionEvent({
        status: SessionEventStatus.VALIDATED,
        chosenResolutionId: 'resolution-123',
        resolvedAt: new Date(),
      });
      jest
        .spyOn(repository, 'validateSessionEvent')
        .mockResolvedValue(validatedEvent);
      jest.spyOn(redisService, 'publish').mockResolvedValue();

      const result = await service.validateSessionEvent(
        { chosenResolutionId: 'resolution-123' },
        mockSessionEvent,
      );

      expect(result).toEqual(validatedEvent);
      expect(repository.validateSessionEvent).toHaveBeenCalledWith(
        { id: 'session-event-123' },
        { chosenResolutionId: 'resolution-123' },
      );
      expect(redisService.publish).toHaveBeenCalledWith(
        'session:session-123:event:validated',
        expect.objectContaining({
          sessionEventId: validatedEvent.id,
          chosenResolutionId: validatedEvent.chosenResolutionId,
        }),
      );
    });
  });

  describe('rejectSessionEvent', () => {
    it('should reject and publish to Redis', async () => {
      const rejectedEvent = createMockSessionEvent({
        status: SessionEventStatus.REJECTED,
        resolvedAt: new Date(),
      });
      jest
        .spyOn(repository, 'rejectSessionEvent')
        .mockResolvedValue(rejectedEvent);
      jest.spyOn(redisService, 'publish').mockResolvedValue();

      const result = await service.rejectSessionEvent(mockSessionEvent);

      expect(result).toEqual(rejectedEvent);
      expect(repository.rejectSessionEvent).toHaveBeenCalledWith({
        id: 'session-event-123',
      });
      expect(redisService.publish).toHaveBeenCalledWith(
        'session:session-123:event:rejected',
        expect.objectContaining({ sessionEventId: rejectedEvent.id }),
      );
    });
  });

  describe('deleteSessionEvent', () => {
    it('should delete and return session event', async () => {
      jest
        .spyOn(repository, 'deleteSessionEvent')
        .mockResolvedValue(mockSessionEvent);

      const result = await service.deleteSessionEvent(mockSessionEvent);

      expect(result).toEqual(mockSessionEvent);
      expect(repository.deleteSessionEvent).toHaveBeenCalledWith({
        id: 'session-event-123',
      });
    });
  });
});
