import { Test, TestingModule } from '@nestjs/testing';
import { ThresholdEventRepository } from '../threshold-event.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createKarmaEventPrismaMock } from '../../karma-event/test/mocks/karma-event.prisma.mock';
import {
  createMockThresholdEvent,
  createMockThresholdEventWithEvent,
} from './fixtures/threshold-event.fixture';
import { ThresholdType } from '../../../generated/prisma/client';

describe('ThresholdEventRepository', () => {
  let repository: ThresholdEventRepository;
  let prisma: PrismaService;

  const mockPrisma = createKarmaEventPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThresholdEventRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(ThresholdEventRepository);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getThresholdEventList', () => {
    it('should return list of threshold events', async () => {
      const mockEvents = [createMockThresholdEvent()];
      mockPrisma.campaignThresholdEvent.findMany.mockResolvedValue(mockEvents);

      const result = await repository.getThresholdEventList(
        { campaignId: 'campaign-123' },
        { take: 11 },
      );

      expect(result).toEqual(mockEvents);
    });
  });

  describe('getThresholdEvent', () => {
    it('should return threshold event with event details', async () => {
      const mockEvent = createMockThresholdEventWithEvent();
      mockPrisma.campaignThresholdEvent.findUnique.mockResolvedValue(mockEvent);

      const result = await repository.getThresholdEvent({
        id: 'threshold-event-123',
      });

      expect(result).toEqual(mockEvent);
      expect(prisma.campaignThresholdEvent.findUnique).toHaveBeenCalledWith({
        where: { id: 'threshold-event-123' },
        include: { event: true },
      });
    });

    it('should return null when not found', async () => {
      mockPrisma.campaignThresholdEvent.findUnique.mockResolvedValue(null);

      const result = await repository.getThresholdEvent({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('getThresholdEventsByType', () => {
    it('should return threshold events filtered by type', async () => {
      const mockEvents = [createMockThresholdEventWithEvent()];
      mockPrisma.campaignThresholdEvent.findMany.mockResolvedValue(mockEvents);

      const result = await repository.getThresholdEventsByType(
        'campaign-123',
        ThresholdType.CHAOS,
      );

      expect(result).toEqual(mockEvents);
      expect(prisma.campaignThresholdEvent.findMany).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaign-123',
          thresholdType: ThresholdType.CHAOS,
        },
        include: { event: true },
      });
    });
  });

  describe('createThresholdEvent', () => {
    it('should create a threshold event', async () => {
      const mockEvent = createMockThresholdEvent();
      mockPrisma.campaignThresholdEvent.create.mockResolvedValue(mockEvent);

      const result = await repository.createThresholdEvent(
        { thresholdType: ThresholdType.CHAOS, eventId: 'event-123' },
        'campaign-123',
      );

      expect(result).toEqual(mockEvent);
      expect(prisma.campaignThresholdEvent.create).toHaveBeenCalledWith({
        data: {
          thresholdType: ThresholdType.CHAOS,
          campaign: { connect: { id: 'campaign-123' } },
          event: { connect: { id: 'event-123' } },
        },
      });
    });
  });

  describe('updateThresholdEvent', () => {
    it('should update threshold type', async () => {
      const mockEvent = createMockThresholdEvent({
        thresholdType: ThresholdType.BLESSING,
      });
      mockPrisma.campaignThresholdEvent.update.mockResolvedValue(mockEvent);

      const result = await repository.updateThresholdEvent(
        { id: 'threshold-event-123' },
        { thresholdType: ThresholdType.BLESSING },
      );

      expect(result).toEqual(mockEvent);
    });

    it('should update event link', async () => {
      const mockEvent = createMockThresholdEvent({ eventId: 'event-456' });
      mockPrisma.campaignThresholdEvent.update.mockResolvedValue(mockEvent);

      const result = await repository.updateThresholdEvent(
        { id: 'threshold-event-123' },
        { eventId: 'event-456' },
      );

      expect(result).toEqual(mockEvent);
      expect(prisma.campaignThresholdEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            event: { connect: { id: 'event-456' } },
          }),
        }),
      );
    });
  });

  describe('deleteThresholdEvent', () => {
    it('should delete a threshold event', async () => {
      const mockEvent = createMockThresholdEvent();
      mockPrisma.campaignThresholdEvent.delete.mockResolvedValue(mockEvent);

      const result = await repository.deleteThresholdEvent({
        id: 'threshold-event-123',
      });

      expect(result).toEqual(mockEvent);
      expect(prisma.campaignThresholdEvent.delete).toHaveBeenCalledWith({
        where: { id: 'threshold-event-123' },
      });
    });
  });
});
