import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventTypeService } from '../event-type.service';
import { EventTypeRepository } from '../event-type.repository';
import { createMockEventType } from './fixtures/event-type.fixture';
import { createMockEventTypeRepository } from './mocks/event-type.repository.mock';

describe('EventTypeService', () => {
  let service: EventTypeService;
  let repository: EventTypeRepository;

  const mockEventType = createMockEventType();
  const mockRepository = createMockEventTypeRepository();

  const mockUser = {
    sub: 'user-123',
    username: 'testuser',
    type: 'gm' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventTypeService,
        {
          provide: EventTypeRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(EventTypeService);
    repository = module.get(EventTypeRepository);

    jest.clearAllMocks();
  });

  describe('getEventTypeList', () => {
    it('should return paginated event type list', async () => {
      const mockEventTypes = [
        createMockEventType({ id: 'event-type-1' }),
        createMockEventType({ id: 'event-type-2' }),
      ];
      jest
        .spyOn(repository, 'getEventTypeList')
        .mockResolvedValue(mockEventTypes);

      const result = await service.getEventTypeList({ limit: 10 });

      expect(result.data).toEqual(mockEventTypes);
      expect(result.count).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(repository.getEventTypeList).toHaveBeenCalledWith(
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const mockEventTypes = Array.from({ length: 11 }, (_, i) =>
        createMockEventType({ id: `event-type-${i}` }),
      );
      jest
        .spyOn(repository, 'getEventTypeList')
        .mockResolvedValue(mockEventTypes);

      const result = await service.getEventTypeList({ limit: 10 });

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('event-type-9');
    });

    it('should set hasPrevious when cursor is present', async () => {
      jest
        .spyOn(repository, 'getEventTypeList')
        .mockResolvedValue([mockEventType]);

      const result = await service.getEventTypeList({
        cursor: 'some-cursor',
        limit: 10,
      });

      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('getEventType', () => {
    it('should return an event type when found', async () => {
      jest.spyOn(repository, 'getEventType').mockResolvedValue(mockEventType);

      const result = await service.getEventType('event-type-123');

      expect(result).toEqual(mockEventType);
      expect(repository.getEventType).toHaveBeenCalledWith({
        id: 'event-type-123',
      });
    });

    it('should throw NotFoundException when event type not found', async () => {
      jest.spyOn(repository, 'getEventType').mockResolvedValue(null);

      await expect(service.getEventType('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getEventType('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createEventType', () => {
    it('should create and return an event type with createdById from user', async () => {
      jest
        .spyOn(repository, 'createEventType')
        .mockResolvedValue(mockEventType);

      const dto = {
        name: 'Wolf embuscade',
        description:
          'An embuscade of wolves triggered when TimeOfDay is NIGHT and Location is FOREST',
      };

      const result = await service.createEventType(dto, mockUser);

      expect(result).toEqual(mockEventType);
      expect(repository.createEventType).toHaveBeenCalledWith({
        ...dto,
        createdById: mockUser.sub,
      });
    });
  });

  describe('updateEventType', () => {
    it('should update and return an event type', async () => {
      const updatedEventType = createMockEventType({ name: 'Updated name' });
      jest
        .spyOn(repository, 'updateEventType')
        .mockResolvedValue(updatedEventType);

      const dto = { name: 'Updated name' };
      const result = await service.updateEventType(dto, mockEventType);

      expect(result).toEqual(updatedEventType);
      expect(repository.updateEventType).toHaveBeenCalledWith(
        { id: 'event-type-123' },
        dto,
      );
    });
  });

  describe('deleteEventType', () => {
    it('should delete and return an event type', async () => {
      jest
        .spyOn(repository, 'deleteEventType')
        .mockResolvedValue(mockEventType);

      const result = await service.deleteEventType(mockEventType);

      expect(result).toEqual(mockEventType);
      expect(repository.deleteEventType).toHaveBeenCalledWith({
        id: 'event-type-123',
      });
    });
  });
});
