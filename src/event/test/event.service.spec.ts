import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventService } from '../event.service';
import { EventRepository } from '../event.repository';
import { EventTypeRepository } from '../../event-type/event-type.repository';
import { createMockEventType } from '../../event-type/test/fixtures/event-type.fixture';
import {
  createMockEvent,
  createMockEventWithCount,
  createMockEventWithDetails,
} from './fixtures/event.fixture';
import { createMockEventRepository } from './mocks/event.repository.mock';
import { createMockEventTypeRepository } from './mocks/event-type.repository.mock';

describe('EventService', () => {
  let service: EventService;
  let repository: EventRepository;
  let eventTypeRepository: EventTypeRepository;

  const mockEvent = createMockEvent();
  const mockEventWithCount = createMockEventWithCount();
  const mockEventWithDetails = createMockEventWithDetails();
  const mockEventType = createMockEventType();
  const mockRepository = createMockEventRepository();
  const mockEventTypeRepository = createMockEventTypeRepository();
  const mockUser = {
    sub: 'user-123',
    username: 'testuser',
    type: 'gm' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EventRepository, useValue: mockRepository },
        { provide: EventTypeRepository, useValue: mockEventTypeRepository },
      ],
    }).compile();

    service = module.get(EventService);
    repository = module.get(EventRepository);
    eventTypeRepository = module.get(EventTypeRepository);

    jest.clearAllMocks();
  });

  describe('getEventList', () => {
    it('should return paginated event list filtered by gameMasterId', async () => {
      const mockEvents = [
        mockEventWithCount,
        createMockEventWithCount({ id: 'event-2' }),
      ];
      jest.spyOn(repository, 'getEventList').mockResolvedValue(mockEvents);

      const result = await service.getEventList({ limit: 10 }, mockUser);

      expect(result.data).toEqual(mockEvents);
      expect(result.count).toBe(2);
      expect(repository.getEventList).toHaveBeenCalledWith(
        expect.objectContaining({ gameMasterId: 'user-123' }),
        expect.any(Object),
      );
    });

    it('should filter by isTemplate when provided', async () => {
      jest.spyOn(repository, 'getEventList').mockResolvedValue([]);

      await service.getEventList({ limit: 10, isTemplate: true }, mockUser);

      expect(repository.getEventList).toHaveBeenCalledWith(
        expect.objectContaining({ isTemplate: true }),
        expect.any(Object),
      );
    });

    it('should filter by isPublic when provided', async () => {
      jest.spyOn(repository, 'getEventList').mockResolvedValue([]);

      await service.getEventList({ limit: 10, isPublic: false }, mockUser);

      expect(repository.getEventList).toHaveBeenCalledWith(
        expect.objectContaining({ isPublic: false }),
        expect.any(Object),
      );
    });

    it('should filter by eventTypeId when provided', async () => {
      jest.spyOn(repository, 'getEventList').mockResolvedValue([]);

      await service.getEventList(
        { limit: 10, eventTypeId: 'event-type-123' },
        mockUser,
      );

      expect(repository.getEventList).toHaveBeenCalledWith(
        expect.objectContaining({ eventTypeId: 'event-type-123' }),
        expect.any(Object),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const mockEvents = Array.from({ length: 11 }, (_, i) =>
        createMockEventWithCount({ id: `event-${i}` }),
      );
      jest.spyOn(repository, 'getEventList').mockResolvedValue(mockEvents);

      const result = await service.getEventList({ limit: 10 }, mockUser);

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('getEvent', () => {
    it('should return detailed event when found', async () => {
      jest
        .spyOn(repository, 'getEvent')
        .mockResolvedValue(mockEventWithDetails);

      const result = await service.getEvent('event-123');

      expect(result).toEqual(mockEventWithDetails);
      expect(repository.getEvent).toHaveBeenCalledWith({ id: 'event-123' });
    });

    it('should throw NotFoundException when event not found', async () => {
      jest.spyOn(repository, 'getEvent').mockResolvedValue(null);

      await expect(service.getEvent('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getEvent('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('createEvent', () => {
    it('should create and return event when eventType exists', async () => {
      jest
        .spyOn(eventTypeRepository, 'getEventType')
        .mockResolvedValue(mockEventType);
      jest
        .spyOn(repository, 'createEvent')
        .mockResolvedValue(mockEventWithCount);

      const dto = {
        name: 'Wolf ambush',
        karmaValue: -10,
        isTemplate: false,
        isPublic: false,
        eventTypeId: 'event-type-123',
      };

      const result = await service.createEvent(dto, mockUser);

      expect(result).toEqual(mockEventWithCount);
      expect(repository.createEvent).toHaveBeenCalledWith(dto, mockUser.sub);
    });

    it('should throw NotFoundException when eventType not found', async () => {
      jest.spyOn(eventTypeRepository, 'getEventType').mockResolvedValue(null);

      await expect(
        service.createEvent(
          { name: 'Test', eventTypeId: 'not-found' },
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEvent', () => {
    it('should update and return event', async () => {
      const updatedEvent = createMockEventWithCount({ name: 'Updated name' });
      jest.spyOn(repository, 'updateEvent').mockResolvedValue(updatedEvent);

      const result = await service.updateEvent(
        { name: 'Updated name' },
        mockEvent,
      );

      expect(result).toEqual(updatedEvent);
      expect(repository.updateEvent).toHaveBeenCalledWith(
        { id: 'event-123' },
        { name: 'Updated name' },
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete and return event', async () => {
      jest.spyOn(repository, 'deleteEvent').mockResolvedValue(mockEvent);

      const result = await service.deleteEvent(mockEvent);

      expect(result).toEqual(mockEvent);
      expect(repository.deleteEvent).toHaveBeenCalledWith({ id: 'event-123' });
    });
  });
});
