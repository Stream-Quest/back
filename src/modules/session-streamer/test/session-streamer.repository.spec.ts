import { Test, TestingModule } from '@nestjs/testing';
import { SessionStreamerRepository } from '../session-streamer.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { createSessionStreamerPrismaMock } from './mocks/session-streamer.prisma.mock';
import {
  createMockSessionStreamer,
  createMockSessionStreamerWithUser,
} from './fixtures/session-streamer.fixture';

describe('SessionStreamerRepository', () => {
  let repository: SessionStreamerRepository;
  let prisma: PrismaService;

  const mockPrisma = createSessionStreamerPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionStreamerRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(SessionStreamerRepository);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('getSessionStreamerList', () => {
    it('should return list of streamers with user details', async () => {
      const mockStreamers = [createMockSessionStreamerWithUser()];
      mockPrisma.sessionStreamer.findMany.mockResolvedValue(mockStreamers);

      const result = await repository.getSessionStreamerList('session-123');

      expect(result).toEqual(mockStreamers);
      expect(prisma.sessionStreamer.findMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-123' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              twitchId: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getSessionStreamer', () => {
    it('should return a streamer by id', async () => {
      const mockStreamer = createMockSessionStreamer();
      mockPrisma.sessionStreamer.findUnique.mockResolvedValue(mockStreamer);

      const result = await repository.getSessionStreamer(
        'session-streamer-123',
      );

      expect(result).toEqual(mockStreamer);
      expect(prisma.sessionStreamer.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-streamer-123' },
      });
    });

    it('should return null when not found', async () => {
      mockPrisma.sessionStreamer.findUnique.mockResolvedValue(null);

      const result = await repository.getSessionStreamer('not-found');

      expect(result).toBeNull();
    });
  });

  describe('getSessionStreamerByUserAndSession', () => {
    it('should return streamer by user and session', async () => {
      const mockStreamer = createMockSessionStreamer();
      mockPrisma.sessionStreamer.findUnique.mockResolvedValue(mockStreamer);

      const result = await repository.getSessionStreamerByUserAndSession(
        'user-123',
        'session-123',
      );

      expect(result).toEqual(mockStreamer);
      expect(prisma.sessionStreamer.findUnique).toHaveBeenCalledWith({
        where: {
          sessionId_userId: { sessionId: 'session-123', userId: 'user-123' },
        },
      });
    });
  });

  describe('getSessionWithCampaign', () => {
    it('should return session with campaign and game master details', async () => {
      const mockSession = {
        id: 'session-123',
        title: 'Session #12',
        campaign: {
          title: 'The Lost Chronicles',
          gameMaster: { username: 'maengdok_' },
        },
      };
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);

      const result = await repository.getSessionWithCampaign('session-123');

      expect(result).toEqual(mockSession);
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        include: {
          campaign: {
            select: {
              title: true,
              gameMaster: { select: { username: true } },
            },
          },
        },
      });
    });

    it('should return null when session not found', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const result = await repository.getSessionWithCampaign('not-found');

      expect(result).toBeNull();
    });
  });

  describe('createSessionStreamer', () => {
    it('should create a streamer', async () => {
      const mockStreamer = createMockSessionStreamer();
      mockPrisma.sessionStreamer.create.mockResolvedValue(mockStreamer);

      const result = await repository.createSessionStreamer(
        'session-123',
        'user-123',
      );

      expect(result).toEqual(mockStreamer);
      expect(prisma.sessionStreamer.create).toHaveBeenCalledWith({
        data: {
          session: { connect: { id: 'session-123' } },
          user: { connect: { id: 'user-123' } },
        },
      });
    });
  });

  describe('updateSessionStreamer', () => {
    it('should update overlay permissions', async () => {
      const mockStreamer = createMockSessionStreamer({ canViewPlayers: true });
      mockPrisma.sessionStreamer.update.mockResolvedValue(mockStreamer);

      const result = await repository.updateSessionStreamer(
        'session-streamer-123',
        { canViewPlayers: true },
      );

      expect(result).toEqual(mockStreamer);
      expect(prisma.sessionStreamer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'session-streamer-123' },
          data: expect.objectContaining({ canViewPlayers: true }),
        }),
      );
    });

    it('should assign a player character', async () => {
      const mockStreamer = createMockSessionStreamer({
        playerCharacterId: 'pc-123',
      });
      mockPrisma.sessionStreamer.update.mockResolvedValue(mockStreamer);

      await repository.updateSessionStreamer('session-streamer-123', {
        playerCharacterId: 'pc-123',
      });

      expect(prisma.sessionStreamer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            playerCharacter: { connect: { id: 'pc-123' } },
          }),
        }),
      );
    });

    it('should disconnect player character when null', async () => {
      mockPrisma.sessionStreamer.update.mockResolvedValue(
        createMockSessionStreamer(),
      );

      await repository.updateSessionStreamer('session-streamer-123', {
        playerCharacterId: null,
      });

      expect(prisma.sessionStreamer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            playerCharacter: { disconnect: true },
          }),
        }),
      );
    });
  });

  describe('deleteSessionStreamer', () => {
    it('should delete a streamer', async () => {
      const mockStreamer = createMockSessionStreamer();
      mockPrisma.sessionStreamer.delete.mockResolvedValue(mockStreamer);

      const result = await repository.deleteSessionStreamer(
        'session-streamer-123',
      );

      expect(result).toEqual(mockStreamer);
      expect(prisma.sessionStreamer.delete).toHaveBeenCalledWith({
        where: { id: 'session-streamer-123' },
      });
    });
  });

  describe('getUserOverlayToken', () => {
    it('should return the overlay token for the user', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        overlayToken: 'overlay-token-123',
      });

      const result = await repository.getUserOverlayToken('user-123');

      expect(result).toEqual({ overlayToken: 'overlay-token-123' });
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { overlayToken: true },
      });
    });
  });
});
