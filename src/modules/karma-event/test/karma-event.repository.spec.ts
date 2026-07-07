import { Test, TestingModule } from '@nestjs/testing';
import { KarmaEventRepository } from '../karma-event.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createKarmaEventPrismaMock } from './mocks/karma-event.prisma.mock';
import { createMockKarmaEvent } from './fixtures/karma-event.fixture';

describe('KarmaEventRepository', () => {
  let repository: KarmaEventRepository;
  let prisma: PrismaService;

  const mockPrisma = createKarmaEventPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KarmaEventRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(KarmaEventRepository);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getKarmaEventList', () => {
    it('should return list of karma events', async () => {
      const mockEvents = [createMockKarmaEvent()];
      mockPrisma.karmaEvent.findMany.mockResolvedValue(mockEvents);

      const result = await repository.getKarmaEventList(
        { campaignId: 'campaign-123' },
        { take: 11, orderBy: { occurredAt: 'desc' } },
      );

      expect(result).toEqual(mockEvents);
      expect(prisma.karmaEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { campaignId: 'campaign-123' } }),
      );
    });
  });

  describe('getKarmaEvent', () => {
    it('should return a karma event by id', async () => {
      const mockEvent = createMockKarmaEvent();
      mockPrisma.karmaEvent.findUnique.mockResolvedValue(mockEvent);

      const result = await repository.getKarmaEvent({ id: 'karma-event-123' });

      expect(result).toEqual(mockEvent);
      expect(prisma.karmaEvent.findUnique).toHaveBeenCalledWith({
        where: { id: 'karma-event-123' },
      });
    });

    it('should return null when not found', async () => {
      mockPrisma.karmaEvent.findUnique.mockResolvedValue(null);

      const result = await repository.getKarmaEvent({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('createKarmaEvent', () => {
    it('should create a karma event without session', async () => {
      const mockEvent = createMockKarmaEvent();
      mockPrisma.karmaEvent.create.mockResolvedValue(mockEvent);

      const result = await repository.createKarmaEvent({
        value: -10,
        reason: 'Wolf Ambush',
        campaignId: 'campaign-123',
      });

      expect(result).toEqual(mockEvent);
      expect(prisma.karmaEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          value: -10,
          reason: 'Wolf Ambush',
          campaign: { connect: { id: 'campaign-123' } },
        }),
      });
    });

    it('should create a karma event with session', async () => {
      const mockEvent = createMockKarmaEvent({ sessionId: 'session-123' });
      mockPrisma.karmaEvent.create.mockResolvedValue(mockEvent);

      const result = await repository.createKarmaEvent({
        value: -10,
        reason: 'Wolf Ambush',
        campaignId: 'campaign-123',
        sessionId: 'session-123',
      });

      expect(result).toEqual(mockEvent);
      expect(prisma.karmaEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          session: { connect: { id: 'session-123' } },
        }),
      });
    });
  });

  describe('incrementCampaignKarma', () => {
    it('should increment campaign karma and return updated values', async () => {
      mockPrisma.campaign.update.mockResolvedValue({
        karmaValue: -10,
        chaosThreshold: -50,
        blessingThreshold: 50,
      });

      const result = await repository.incrementCampaignKarma(
        'campaign-123',
        -10,
      );

      expect(result).toEqual({
        karmaValue: -10,
        chaosThreshold: -50,
        blessingThreshold: 50,
      });
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaign-123' },
        data: { karmaValue: { increment: -10 } },
        select: {
          karmaValue: true,
          chaosThreshold: true,
          blessingThreshold: true,
        },
      });
    });
  });
});
