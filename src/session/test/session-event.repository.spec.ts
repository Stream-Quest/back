import { Test, TestingModule } from '@nestjs/testing';
import { SessionEventRepository } from '../session-event.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionEventStatus } from '../../generated/prisma/client';
import {
  createMockSessionEvent,
  createMockSessionEventWithDetails,
} from './fixtures/session-event.fixture';
import { createMockSessionEventPrismaService } from './mocks/session-event.prisma.mock';

describe('SessionEventRepository', () => {
  let repository: SessionEventRepository;
  let prismaService: PrismaService;

  const mockSessionEvent = createMockSessionEvent();
  const mockSessionEventWithDetails = createMockSessionEventWithDetails();
  const mockPrismaService = createMockSessionEventPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionEventRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get(SessionEventRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getSessionEventList', () => {
    it('should return session events in forward direction', async () => {
      jest
        .spyOn(prismaService.sessionEvent, 'findMany')
        .mockResolvedValue([mockSessionEvent]);

      const result = await repository.getSessionEventList(
        { sessionId: 'session-123' },
        { take: 10, direction: 'forward' },
      );

      expect(result).toEqual([mockSessionEvent]);
      expect(prismaService.sessionEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sessionId: 'session-123' },
          take: 10,
        }),
      );
    });

    it('should return session events in backward direction (reversed)', async () => {
      const events = [
        createMockSessionEvent({ id: 'session-event-1' }),
        createMockSessionEvent({ id: 'session-event-2' }),
      ];
      jest
        .spyOn(prismaService.sessionEvent, 'findMany')
        .mockResolvedValue([...events]);

      const result = await repository.getSessionEventList(
        { sessionId: 'session-123' },
        { take: 10, direction: 'backward', cursor: 'cursor-123' },
      );

      expect(result).toEqual([...events].reverse());
    });
  });

  describe('getSessionEvent', () => {
    it('should return session event with details when found', async () => {
      jest
        .spyOn(prismaService.sessionEvent, 'findUnique')
        .mockResolvedValue(mockSessionEventWithDetails);

      const result = await repository.getSessionEvent({
        id: 'session-event-123',
      });

      expect(result).toEqual(mockSessionEventWithDetails);
      expect(prismaService.sessionEvent.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-event-123' },
        include: expect.objectContaining({
          event: expect.any(Object),
          chosenResolution: expect.any(Object),
          sessionEventResolutions: true,
        }),
      });
    });

    it('should return null when not found', async () => {
      jest
        .spyOn(prismaService.sessionEvent, 'findUnique')
        .mockResolvedValue(null);

      const result = await repository.getSessionEvent({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('createSessionEvent', () => {
    it('should create and return a session event with current time', async () => {
      jest
        .spyOn(prismaService.sessionEvent, 'create')
        .mockResolvedValue(mockSessionEvent);

      const dto = { eventId: 'event-123' };
      const result = await repository.createSessionEvent(dto, 'session-123');

      expect(result).toEqual(mockSessionEvent);
      expect(prismaService.sessionEvent.create).toHaveBeenCalledWith({
        data: {
          session: { connect: { id: 'session-123' } },
          event: { connect: { id: 'event-123' } },
          triggeredAt: expect.any(Date),
        },
      });
    });

    it('should use provided triggeredAt when given', async () => {
      jest
        .spyOn(prismaService.sessionEvent, 'create')
        .mockResolvedValue(mockSessionEvent);

      const dto = {
        eventId: 'event-123',
        triggeredAt: '2024-01-01T10:00:00.000Z',
      };
      await repository.createSessionEvent(dto, 'session-123');

      const callArg = (prismaService.sessionEvent.create as jest.Mock).mock
        .calls[0][0];
      expect(callArg.data.triggeredAt).toEqual(
        new Date('2024-01-01T10:00:00.000Z'),
      );
    });
  });

  describe('updateSessionEvent', () => {
    it('should update finalMessage when provided', async () => {
      const updatedEvent = createMockSessionEvent({
        finalMessage: 'Custom message',
      });
      jest
        .spyOn(prismaService.sessionEvent, 'update')
        .mockResolvedValue(updatedEvent);

      const result = await repository.updateSessionEvent(
        { id: 'session-event-123' },
        { finalMessage: 'Custom message' },
      );

      expect(result).toEqual(updatedEvent);
      expect(prismaService.sessionEvent.update).toHaveBeenCalledWith({
        where: { id: 'session-event-123' },
        data: { finalMessage: 'Custom message' },
      });
    });

    it('should connect new event when eventId provided', async () => {
      jest
        .spyOn(prismaService.sessionEvent, 'update')
        .mockResolvedValue(mockSessionEvent);

      await repository.updateSessionEvent(
        { id: 'session-event-123' },
        { eventId: 'new-event-123' },
      );

      const callArg = (prismaService.sessionEvent.update as jest.Mock).mock
        .calls[0][0];
      expect(callArg.data.event).toEqual({
        connect: { id: 'new-event-123' },
      });
    });
  });

  describe('validateSessionEvent', () => {
    it('should set status to VALIDATED and set resolvedAt', async () => {
      const validatedEvent = createMockSessionEvent({
        status: SessionEventStatus.VALIDATED,
        chosenResolutionId: 'resolution-123',
        resolvedAt: new Date(),
      });
      jest
        .spyOn(prismaService.sessionEvent, 'update')
        .mockResolvedValue(validatedEvent);

      const result = await repository.validateSessionEvent(
        { id: 'session-event-123' },
        { chosenResolutionId: 'resolution-123' },
      );

      expect(result).toEqual(validatedEvent);
      expect(prismaService.sessionEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'session-event-123' },
          data: expect.objectContaining({
            status: SessionEventStatus.VALIDATED,
            resolvedAt: expect.any(Date),
            chosenResolution: { connect: { id: 'resolution-123' } },
          }),
        }),
      );
    });

    it('should set finalMessage when provided', async () => {
      jest
        .spyOn(prismaService.sessionEvent, 'update')
        .mockResolvedValue(mockSessionEvent);

      await repository.validateSessionEvent(
        { id: 'session-event-123' },
        {
          chosenResolutionId: 'resolution-123',
          finalMessage: 'Custom message',
        },
      );

      const callArg = (prismaService.sessionEvent.update as jest.Mock).mock
        .calls[0][0];
      expect(callArg.data.finalMessage).toBe('Custom message');
    });
  });

  describe('rejectSessionEvent', () => {
    it('should set status to REJECTED and set resolvedAt', async () => {
      const rejectedEvent = createMockSessionEvent({
        status: SessionEventStatus.REJECTED,
        resolvedAt: new Date(),
      });
      jest
        .spyOn(prismaService.sessionEvent, 'update')
        .mockResolvedValue(rejectedEvent);

      const result = await repository.rejectSessionEvent({
        id: 'session-event-123',
      });

      expect(result).toEqual(rejectedEvent);
      expect(prismaService.sessionEvent.update).toHaveBeenCalledWith({
        where: { id: 'session-event-123' },
        data: {
          status: SessionEventStatus.REJECTED,
          resolvedAt: expect.any(Date),
        },
      });
    });
  });

  describe('deleteSessionEvent', () => {
    it('should delete and return session event', async () => {
      jest
        .spyOn(prismaService.sessionEvent, 'delete')
        .mockResolvedValue(mockSessionEvent);

      const result = await repository.deleteSessionEvent({
        id: 'session-event-123',
      });

      expect(result).toEqual(mockSessionEvent);
      expect(prismaService.sessionEvent.delete).toHaveBeenCalledWith({
        where: { id: 'session-event-123' },
      });
    });
  });
});
