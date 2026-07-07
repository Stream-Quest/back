import { Test, TestingModule } from '@nestjs/testing';
import { SessionGateway } from '../gateway/session.gateway';
import { RedisService } from '../../../redis/redis.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createMockSession } from './fixtures/session.fixture';
import { createMockCampaign } from '../../campaign/test/fixtures/campaign.fixture';

const createMockRedisService = () => ({
  publish: jest.fn(),
  psubscribe: jest.fn().mockResolvedValue(undefined),
});

const createMockPrismaService = () => ({
  session: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
});

const createMockJwtService = () => ({
  verify: jest.fn(),
});

const createMockSocket = (authOverrides: Record<string, string> = {}) => ({
  id: 'socket-123',
  data: {},
  handshake: {
    auth: authOverrides,
  },
  disconnect: jest.fn(),
  emit: jest.fn(),
  join: jest.fn().mockResolvedValue(undefined),
  leave: jest.fn().mockResolvedValue(undefined),
});

const createMockServer = () => ({
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
});

describe('SessionGateway', () => {
  let gateway: SessionGateway;
  let redisService: ReturnType<typeof createMockRedisService>;
  let prismaService: ReturnType<typeof createMockPrismaService>;
  let jwtService: ReturnType<typeof createMockJwtService>;

  const mockSession = createMockSession();
  const mockCampaign = createMockCampaign();

  beforeEach(async () => {
    redisService = createMockRedisService();
    prismaService = createMockPrismaService();
    jwtService = createMockJwtService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionGateway,
        { provide: RedisService, useValue: redisService },
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    gateway = module.get(SessionGateway);
    gateway.server = createMockServer() as any;

    jest.clearAllMocks();
  });

  // ─── afterInit ──────────────────────────────────────────────────────────────

  describe('afterInit', () => {
    it('should subscribe to session:* pattern on Redis', async () => {
      await gateway.afterInit();

      expect(redisService.psubscribe).toHaveBeenCalledWith(
        'session:*',
        expect.any(Function),
      );
    });
  });

  // ─── handleConnection ───────────────────────────────────────────────────────

  describe('handleConnection', () => {
    it('should disconnect client when no token is provided', async () => {
      const client = createMockSocket({});

      await gateway.handleConnection(client as any);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should set client data as overlay when overlayToken is valid', async () => {
      const client = createMockSocket({ overlayToken: 'valid-overlay-token' });
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        overlayToken: 'valid-overlay-token',
      });

      await gateway.handleConnection(client as any);

      expect(client.data).toEqual({ userId: 'user-123', type: 'overlay' });
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client when overlayToken is invalid', async () => {
      const client = createMockSocket({ overlayToken: 'invalid-token' });
      prismaService.user.findUnique.mockResolvedValue(null);

      await gateway.handleConnection(client as any);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should set client data as gm when JWT is valid and type is ws', async () => {
      const client = createMockSocket({ token: 'valid-jwt' });
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        username: 'testuser',
        type: 'ws',
      });

      await gateway.handleConnection(client as any);

      expect(client.data).toEqual({ userId: 'user-123', type: 'gm' });
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client when JWT type is not ws', async () => {
      const client = createMockSocket({ token: 'valid-jwt-not-ws' });
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        username: 'testuser',
        type: 'gm',
      });

      await gateway.handleConnection(client as any);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client when JWT is invalid', async () => {
      const client = createMockSocket({ token: 'invalid-jwt' });
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await gateway.handleConnection(client as any);

      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  // ─── handleDisconnect ───────────────────────────────────────────────────────

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const client = createMockSocket();

      expect(() => gateway.handleDisconnect(client as any)).not.toThrow();
    });
  });

  // ─── handleJoin ─────────────────────────────────────────────────────────────

  describe('handleJoin', () => {
    it('should disconnect unauthenticated client', async () => {
      const client = createMockSocket();
      client.data = {};

      await gateway.handleJoin(client as any, 'session-123');

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should emit session:error when session is not found', async () => {
      const client = createMockSocket();
      client.data = { userId: 'user-123', type: 'gm' };
      prismaService.session.findUnique.mockResolvedValue(null);

      await gateway.handleJoin(client as any, 'not-found');

      expect(client.emit).toHaveBeenCalledWith('session:error', {
        message: 'Session not found',
      });
    });

    it('should emit session:error when GM does not own the session', async () => {
      const client = createMockSocket();
      client.data = { userId: 'other-user', type: 'gm' };
      prismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        campaign: { ...mockCampaign, gameMasterId: 'user-123' },
      });

      await gateway.handleJoin(client as any, mockSession.id);

      expect(client.emit).toHaveBeenCalledWith('session:error', {
        message: 'You do not own this session',
      });
    });

    it('should allow GM to join when they own the session', async () => {
      const client = createMockSocket();
      client.data = { userId: 'user-123', type: 'gm' };
      prismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        campaign: { ...mockCampaign, gameMasterId: 'user-123' },
      });

      await gateway.handleJoin(client as any, mockSession.id);

      expect(client.join).toHaveBeenCalledWith(`session:${mockSession.id}`);
      expect(client.emit).toHaveBeenCalledWith('session:joined', {
        sessionId: mockSession.id,
      });
    });

    it('should allow overlay to join without ownership check', async () => {
      const client = createMockSocket();
      client.data = { userId: 'user-123', type: 'overlay' };
      prismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        campaign: { ...mockCampaign, gameMasterId: 'other-user' },
      });

      await gateway.handleJoin(client as any, mockSession.id);

      expect(client.join).toHaveBeenCalledWith(`session:${mockSession.id}`);
      expect(client.emit).toHaveBeenCalledWith('session:joined', {
        sessionId: mockSession.id,
      });
    });
  });

  // ─── handleLeave ────────────────────────────────────────────────────────────

  describe('handleLeave', () => {
    it('should leave the room and emit session:left', async () => {
      const client = createMockSocket();
      client.data = { userId: 'user-123', type: 'gm' };

      await gateway.handleLeave(client as any, mockSession.id);

      expect(client.leave).toHaveBeenCalledWith(`session:${mockSession.id}`);
      expect(client.emit).toHaveBeenCalledWith('session:left', {
        sessionId: mockSession.id,
      });
    });
  });
});
