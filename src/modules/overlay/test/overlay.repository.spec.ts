import { Test, TestingModule } from '@nestjs/testing';
import { OverlayRepository } from '../overlay.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createOverlayPrismaMock } from './mocks/overlay.prisma.mock';
import {
  createMockActivePlayer,
  createMockContextSnapshot,
  createMockMilestone,
  createMockSessionEvent,
} from './fixtures/overlay.fixture';

describe('OverlayRepository', () => {
  let repository: OverlayRepository;
  let prisma: PrismaService;

  const mockPrisma = createOverlayPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OverlayRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(OverlayRepository);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should return the last 20 session events', async () => {
      const mockEvents = [createMockSessionEvent()];
      mockPrisma.sessionEvent.findMany.mockResolvedValue(mockEvents);

      const result = await repository.getEvents('session-123');

      expect(result).toEqual(mockEvents);
      expect(prisma.sessionEvent.findMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-123' },
        orderBy: { triggeredAt: 'desc' },
        take: 20,
      });
    });
  });

  describe('getSessionCampaignKarma', () => {
    it('should return the campaign karma fields', async () => {
      const mockKarma = {
        karmaValue: 10,
        chaosThreshold: -50,
        blessingThreshold: 50,
      };
      mockPrisma.session.findUnique.mockResolvedValue({ campaign: mockKarma });

      const result = await repository.getSessionCampaignKarma('session-123');

      expect(result).toEqual(mockKarma);
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        select: {
          campaign: {
            select: {
              karmaValue: true,
              chaosThreshold: true,
              blessingThreshold: true,
            },
          },
        },
      });
    });

    it('should return null when session not found', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const result = await repository.getSessionCampaignKarma('not-found');

      expect(result).toBeNull();
    });
  });

  describe('getLatestContextSnapshot', () => {
    it('should return the latest context snapshot with weather and location', async () => {
      const mockSnapshot = createMockContextSnapshot();
      mockPrisma.contextSnapshot.findFirst.mockResolvedValue(mockSnapshot);

      const result = await repository.getLatestContextSnapshot('session-123');

      expect(result).toEqual(mockSnapshot);
      expect(prisma.contextSnapshot.findFirst).toHaveBeenCalledWith({
        where: { sessionId: 'session-123' },
        orderBy: { snapshotAt: 'desc' },
        include: { weather: true, location: true },
      });
    });
  });

  describe('getActivePlayers', () => {
    it('should return active session player characters', async () => {
      const mockPlayers = [createMockActivePlayer()];
      mockPrisma.sessionPlayerCharacter.findMany.mockResolvedValue(mockPlayers);

      const result = await repository.getActivePlayers('session-123');

      expect(result).toEqual(mockPlayers);
      expect(prisma.sessionPlayerCharacter.findMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-123', status: 'ACTIVE' },
        include: { playerCharacter: true },
      });
    });
  });

  describe('getSessionCampaignId', () => {
    it('should return the campaign id', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        campaignId: 'campaign-123',
      });

      const result = await repository.getSessionCampaignId('session-123');

      expect(result).toBe('campaign-123');
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        select: { campaignId: true },
      });
    });

    it('should return null when session not found', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const result = await repository.getSessionCampaignId('not-found');

      expect(result).toBeNull();
    });
  });

  describe('getMilestones', () => {
    it('should return active, progress-visible twitch event mappings', async () => {
      const mockMilestones = [createMockMilestone()];
      mockPrisma.twitchEventMapping.findMany.mockResolvedValue(mockMilestones);

      const result = await repository.getMilestones('campaign-123');

      expect(result).toEqual(mockMilestones);
      expect(prisma.twitchEventMapping.findMany).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaign-123',
          isActive: true,
          showProgress: true,
        },
        include: { event: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      });
    });
  });
});
