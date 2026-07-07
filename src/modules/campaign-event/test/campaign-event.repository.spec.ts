import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  createMockCampaignEvent,
  createMockCampaignEventWithEvent,
} from './fixtures/campaign-event.fixture';
import { createMockCampaignEventPrismaService } from './mocks/campaign-event.prisma.mock';
import { CampaignEventRepository } from '../campaign-event.repository';

describe('CampaignEventRepository', () => {
  let repository: CampaignEventRepository;
  let prismaService: PrismaService;

  const mockCampaignEvent = createMockCampaignEvent();
  const mockCampaignEventWithEvent = createMockCampaignEventWithEvent();
  const mockPrismaService = createMockCampaignEventPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignEventRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(CampaignEventRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getCampaignEventList', () => {
    it('should return campaign events in forward direction', async () => {
      jest
        .spyOn(prismaService.campaignEvent, 'findMany')
        .mockResolvedValue([mockCampaignEvent]);

      const result = await repository.getCampaignEventList(
        { campaignId: 'campaign-123' },
        { take: 10, direction: 'forward' },
      );

      expect(result).toEqual([mockCampaignEvent]);
      expect(prismaService.campaignEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { campaignId: 'campaign-123' },
          take: 10,
        }),
      );
    });

    it('should return campaign events in backward direction (reversed)', async () => {
      const events = [
        createMockCampaignEvent({ id: 'campaign-event-1' }),
        createMockCampaignEvent({ id: 'campaign-event-2' }),
      ];
      jest
        .spyOn(prismaService.campaignEvent, 'findMany')
        .mockResolvedValue([...events]);

      const result = await repository.getCampaignEventList(
        { campaignId: 'campaign-123' },
        { take: 10, direction: 'backward', cursor: 'cursor-123' },
      );

      expect(result).toEqual([...events].reverse());
    });
  });

  describe('getCampaignEvent', () => {
    it('should return campaign event with event details when found', async () => {
      jest
        .spyOn(prismaService.campaignEvent, 'findUnique')
        .mockResolvedValue(mockCampaignEventWithEvent);

      const result = await repository.getCampaignEvent({
        id: 'campaign-event-123',
      });

      expect(result).toEqual(mockCampaignEventWithEvent);
      expect(prismaService.campaignEvent.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaign-event-123' },
        include: expect.objectContaining({
          event: expect.any(Object),
        }),
      });
    });

    it('should return null when not found', async () => {
      jest
        .spyOn(prismaService.campaignEvent, 'findUnique')
        .mockResolvedValue(null);

      const result = await repository.getCampaignEvent({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('createCampaignEvent', () => {
    it('should create and return a campaign event', async () => {
      jest
        .spyOn(prismaService.campaignEvent, 'create')
        .mockResolvedValue(mockCampaignEvent);

      const dto = { eventId: 'event-123', isActive: true };
      const result = await repository.createCampaignEvent(dto, 'campaign-123');

      expect(result).toEqual(mockCampaignEvent);
      expect(prismaService.campaignEvent.create).toHaveBeenCalledWith({
        data: {
          isActive: true,
          campaign: { connect: { id: 'campaign-123' } },
          event: { connect: { id: 'event-123' } },
        },
      });
    });

    it('should default isActive to true when not provided', async () => {
      jest
        .spyOn(prismaService.campaignEvent, 'create')
        .mockResolvedValue(mockCampaignEvent);

      await repository.createCampaignEvent(
        { eventId: 'event-123' },
        'campaign-123',
      );

      const callArg = (prismaService.campaignEvent.create as jest.Mock).mock
        .calls[0][0];
      expect(callArg.data.isActive).toBe(true);
    });
  });

  describe('updateCampaignEvent', () => {
    it('should update and return a campaign event', async () => {
      const updatedEvent = createMockCampaignEvent({ isActive: false });
      jest
        .spyOn(prismaService.campaignEvent, 'update')
        .mockResolvedValue(updatedEvent);

      const result = await repository.updateCampaignEvent(
        { id: 'campaign-event-123' },
        { isActive: false },
      );

      expect(result).toEqual(updatedEvent);
      expect(prismaService.campaignEvent.update).toHaveBeenCalledWith({
        where: { id: 'campaign-event-123' },
        data: { isActive: false },
      });
    });
  });

  describe('deleteCampaignEvent', () => {
    it('should delete and return a campaign event', async () => {
      jest
        .spyOn(prismaService.campaignEvent, 'delete')
        .mockResolvedValue(mockCampaignEvent);

      const result = await repository.deleteCampaignEvent({
        id: 'campaign-event-123',
      });

      expect(result).toEqual(mockCampaignEvent);
      expect(prismaService.campaignEvent.delete).toHaveBeenCalledWith({
        where: { id: 'campaign-event-123' },
      });
    });
  });
});
