import { Test, TestingModule } from '@nestjs/testing';
import { TwitchMappingRepository } from '../twitch-mapping.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createTwitchMappingPrismaMock } from './mocks/twitch-mapping.prisma.mock';
import {
  createMockTwitchMapping,
  createMockTwitchMappingWithEvent,
} from './fixtures/twitch-mapping.fixture';
import { TriggerType } from '../../../generated/prisma/client';

describe('TwitchMappingRepository', () => {
  let repository: TwitchMappingRepository;
  let prisma: PrismaService;

  const mockPrisma = createTwitchMappingPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitchMappingRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(TwitchMappingRepository);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getTwitchMappingList', () => {
    it('should return list of twitch mappings', async () => {
      const mockMappings = [createMockTwitchMapping()];
      mockPrisma.twitchEventMapping.findMany.mockResolvedValue(mockMappings);

      const result = await repository.getTwitchMappingList(
        { campaignId: 'campaign-123' },
        { take: 11 },
      );

      expect(result).toEqual(mockMappings);
      expect(prisma.twitchEventMapping.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { campaignId: 'campaign-123' } }),
      );
    });
  });

  describe('getTwitchMapping', () => {
    it('should return twitch mapping with event', async () => {
      const mockMapping = createMockTwitchMappingWithEvent();
      mockPrisma.twitchEventMapping.findUnique.mockResolvedValue(mockMapping);

      const result = await repository.getTwitchMapping({
        id: 'twitch-mapping-123',
      });

      expect(result).toEqual(mockMapping);
      expect(prisma.twitchEventMapping.findUnique).toHaveBeenCalledWith({
        where: { id: 'twitch-mapping-123' },
        include: { event: true },
      });
    });

    it('should return null when not found', async () => {
      mockPrisma.twitchEventMapping.findUnique.mockResolvedValue(null);

      const result = await repository.getTwitchMapping({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('getActiveMappingsByType', () => {
    it('should return active mappings filtered by type', async () => {
      const mockMappings = [createMockTwitchMappingWithEvent()];
      mockPrisma.twitchEventMapping.findMany.mockResolvedValue(mockMappings);

      const result = await repository.getActiveMappingsByType(
        'campaign-123',
        TriggerType.SUB_TIER1,
      );

      expect(result).toEqual(mockMappings);
      expect(prisma.twitchEventMapping.findMany).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaign-123',
          twitchEventType: TriggerType.SUB_TIER1,
          isActive: true,
        },
        include: { event: true },
      });
    });
  });

  describe('createTwitchMapping', () => {
    it('should create a twitch mapping', async () => {
      const mockMapping = createMockTwitchMapping();
      mockPrisma.twitchEventMapping.create.mockResolvedValue(mockMapping);

      const result = await repository.createTwitchMapping(
        {
          twitchEventType: TriggerType.SUB_TIER1,
          eventId: 'event-123',
          isActive: true,
        },
        'campaign-123',
      );

      expect(result).toEqual(mockMapping);
      expect(prisma.twitchEventMapping.create).toHaveBeenCalledWith({
        data: {
          twitchEventType: TriggerType.SUB_TIER1,
          isActive: true,
          threshold: 1,
          showProgress: true,
          campaign: { connect: { id: 'campaign-123' } },
          event: { connect: { id: 'event-123' } },
        },
      });
    });
  });

  describe('updateTwitchMapping', () => {
    it('should update isActive', async () => {
      const mockMapping = createMockTwitchMapping({ isActive: false });
      mockPrisma.twitchEventMapping.update.mockResolvedValue(mockMapping);

      const result = await repository.updateTwitchMapping(
        { id: 'twitch-mapping-123' },
        { isActive: false },
      );

      expect(result).toEqual(mockMapping);
      expect(prisma.twitchEventMapping.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('should update event link', async () => {
      const mockMapping = createMockTwitchMapping({ eventId: 'event-456' });
      mockPrisma.twitchEventMapping.update.mockResolvedValue(mockMapping);

      await repository.updateTwitchMapping(
        { id: 'twitch-mapping-123' },
        { eventId: 'event-456' },
      );

      expect(prisma.twitchEventMapping.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            event: { connect: { id: 'event-456' } },
          }),
        }),
      );
    });
  });

  describe('deleteTwitchMapping', () => {
    it('should delete a twitch mapping', async () => {
      const mockMapping = createMockTwitchMapping();
      mockPrisma.twitchEventMapping.delete.mockResolvedValue(mockMapping);

      const result = await repository.deleteTwitchMapping({
        id: 'twitch-mapping-123',
      });

      expect(result).toEqual(mockMapping);
      expect(prisma.twitchEventMapping.delete).toHaveBeenCalledWith({
        where: { id: 'twitch-mapping-123' },
      });
    });
  });
});
