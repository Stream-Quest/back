import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from '../event.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  createMockEvent,
  createMockEventWithCount,
  createMockEventWithDetails,
} from './fixtures/event.fixture';
import { createMockPrismaService } from './mocks/event.prisma.mock';

describe('EventRepository', () => {
  let repository: EventRepository;
  let prismaService: PrismaService;

  const mockEvent = createMockEvent();
  const mockEventWithCount = createMockEventWithCount();
  const mockEventWithDetails = createMockEventWithDetails();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(EventRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getEventList', () => {
    it('should return events with count in forward direction', async () => {
      jest
        .spyOn(prismaService.event, 'findMany')
        .mockResolvedValue([mockEventWithCount]);

      const result = await repository.getEventList(
        { gameMasterId: 'user-123' },
        { take: 10, direction: 'forward' },
      );

      expect(result).toEqual([mockEventWithCount]);
      expect(prismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { gameMasterId: 'user-123' },
          include: expect.objectContaining({ _count: expect.any(Object) }),
        }),
      );
    });

    it('should return events in backward direction (reversed)', async () => {
      const events = [
        createMockEventWithCount({ id: 'event-1' }),
        createMockEventWithCount({ id: 'event-2' }),
      ];
      jest
        .spyOn(prismaService.event, 'findMany')
        .mockResolvedValue([...events]);

      const result = await repository.getEventList(
        { gameMasterId: 'user-123' },
        { take: 10, direction: 'backward', cursor: 'cursor-123' },
      );

      expect(result).toEqual([...events].reverse());
    });
  });

  describe('getEvent', () => {
    it('should return event with details when found', async () => {
      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue(mockEventWithDetails);

      const result = await repository.getEvent({ id: 'event-123' });

      expect(result).toEqual(mockEventWithDetails);
      expect(prismaService.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-123' },
        include: expect.objectContaining({
          rules: true,
          resolutions: expect.any(Object),
        }),
      });
    });

    it('should return null when event not found', async () => {
      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(null);

      const result = await repository.getEvent({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('createEvent', () => {
    it('should create and return event with count', async () => {
      jest
        .spyOn(prismaService.event, 'create')
        .mockResolvedValue(mockEventWithCount);

      const dto = {
        name: 'Wolf ambush',
        karmaValue: -10,
        isTemplate: false,
        isPublic: false,
        eventTypeId: 'event-type-123',
      };

      const result = await repository.createEvent(dto, 'user-123');

      expect(result).toEqual(mockEventWithCount);
      expect(prismaService.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Wolf ambush',
            eventType: { connect: { id: 'event-type-123' } },
            gameMaster: { connect: { id: 'user-123' } },
          }),
        }),
      );
    });

    it('should not include eventTypeId directly in data', async () => {
      jest
        .spyOn(prismaService.event, 'create')
        .mockResolvedValue(mockEventWithCount);

      await repository.createEvent(
        { name: 'Test', eventTypeId: 'event-type-123' },
        'user-123',
      );

      const callArg = (prismaService.event.create as jest.Mock).mock
        .calls[0][0];
      expect(callArg.data.eventTypeId).toBeUndefined();
      expect(callArg.data.eventType).toEqual({
        connect: { id: 'event-type-123' },
      });
    });
  });

  describe('updateEvent', () => {
    it('should update and return event with count', async () => {
      const updatedEvent = createMockEventWithCount({ name: 'Updated name' });
      jest.spyOn(prismaService.event, 'update').mockResolvedValue(updatedEvent);

      const result = await repository.updateEvent(
        { id: 'event-123' },
        { name: 'Updated name' },
      );

      expect(result).toEqual(updatedEvent);
      expect(prismaService.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'event-123' },
          data: { name: 'Updated name' },
        }),
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete and return event', async () => {
      jest.spyOn(prismaService.event, 'delete').mockResolvedValue(mockEvent);

      const result = await repository.deleteEvent({ id: 'event-123' });

      expect(result).toEqual(mockEvent);
      expect(prismaService.event.delete).toHaveBeenCalledWith({
        where: { id: 'event-123' },
      });
    });
  });
});
