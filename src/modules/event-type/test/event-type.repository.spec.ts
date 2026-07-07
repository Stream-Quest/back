import { Test, TestingModule } from '@nestjs/testing';
import { EventTypeRepository } from '../event-type.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createMockEventType } from './fixtures/event-type.fixture';
import { createMockPrismaService } from './mocks/event-type.prisma.mock';

describe('EventTypeRepository', () => {
  let repository: EventTypeRepository;
  let prismaService: PrismaService;

  const mockEventType = createMockEventType();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventTypeRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(EventTypeRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getEventType', () => {
    it('should return an event type when found', async () => {
      jest
        .spyOn(prismaService.eventType, 'findUnique')
        .mockResolvedValue(mockEventType);

      const result = await repository.getEventType({ id: 'event-type-123' });

      expect(result).toEqual(mockEventType);
      expect(prismaService.eventType.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-type-123' },
      });
    });

    it('should return null when event type not found', async () => {
      jest.spyOn(prismaService.eventType, 'findUnique').mockResolvedValue(null);

      const result = await repository.getEventType({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('getEventTypeList', () => {
    const mockEventTypes = [
      createMockEventType({ id: 'event-type-1', name: 'Wolf embuscade' }),
      createMockEventType({ id: 'event-type-2', name: 'Bandit ambush' }),
    ];

    it('should return event types in forward direction', async () => {
      jest
        .spyOn(prismaService.eventType, 'findMany')
        .mockResolvedValue(mockEventTypes);

      const result = await repository.getEventTypeList({
        take: 10,
        direction: 'forward',
      });

      expect(result).toEqual(mockEventTypes);
      expect(prismaService.eventType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return event types in backward direction (reversed)', async () => {
      jest
        .spyOn(prismaService.eventType, 'findMany')
        .mockResolvedValue([...mockEventTypes]);

      const result = await repository.getEventTypeList({
        take: 10,
        direction: 'backward',
        cursor: 'cursor-123',
      });

      expect(result).toEqual([...mockEventTypes].reverse());
      expect(prismaService.eventType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: -10,
          skip: 1,
          cursor: { id: 'cursor-123' },
        }),
      );
    });

    it('should use default take value of 10', async () => {
      jest
        .spyOn(prismaService.eventType, 'findMany')
        .mockResolvedValue(mockEventTypes);

      await repository.getEventTypeList();

      expect(prismaService.eventType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('createEventType', () => {
    it('should create and return an event type', async () => {
      jest
        .spyOn(prismaService.eventType, 'create')
        .mockResolvedValue(mockEventType);

      const dto = {
        name: 'Wolf embuscade',
        description:
          'An embuscade of wolves triggered when TimeOfDay is NIGHT and Location is FOREST',
        createdById: 'user-123',
      };

      const result = await repository.createEventType(dto);

      expect(result).toEqual(mockEventType);
      expect(prismaService.eventType.create).toHaveBeenCalledWith({
        data: {
          name: 'Wolf embuscade',
          description:
            'An embuscade of wolves triggered when TimeOfDay is NIGHT and Location is FOREST',
          createdBy: {
            connect: { id: 'user-123' },
          },
        },
      });
    });

    it('should not include createdById directly in data, using connect instead', async () => {
      jest
        .spyOn(prismaService.eventType, 'create')
        .mockResolvedValue(mockEventType);

      await repository.createEventType({
        name: 'Bandit ambush',
        createdById: 'user-456',
      });

      const callArg = (prismaService.eventType.create as jest.Mock).mock
        .calls[0][0];

      expect(callArg.data.createdById).toBeUndefined();
      expect(callArg.data.createdBy).toEqual({
        connect: { id: 'user-456' },
      });
    });
  });

  describe('updateEventType', () => {
    it('should update and return an event type', async () => {
      const updatedEventType = createMockEventType({ name: 'Updated name' });
      jest
        .spyOn(prismaService.eventType, 'update')
        .mockResolvedValue(updatedEventType);

      const result = await repository.updateEventType(
        { id: 'event-type-123' },
        { name: 'Updated name' },
      );

      expect(result).toEqual(updatedEventType);
      expect(prismaService.eventType.update).toHaveBeenCalledWith({
        where: { id: 'event-type-123' },
        data: { name: 'Updated name' },
      });
    });
  });

  describe('deleteEventType', () => {
    it('should delete and return an event type', async () => {
      jest
        .spyOn(prismaService.eventType, 'delete')
        .mockResolvedValue(mockEventType);

      const result = await repository.deleteEventType({
        id: 'event-type-123',
      });

      expect(result).toEqual(mockEventType);
      expect(prismaService.eventType.delete).toHaveBeenCalledWith({
        where: { id: 'event-type-123' },
      });
    });
  });
});
