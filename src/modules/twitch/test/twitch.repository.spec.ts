import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitchService } from '../twitch.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../redis/redis.service';
import { TwitchMappingRepository } from '../../twitch-mapping/twitch-mapping.repository';
import { TriggerType } from '../../../generated/prisma/client';
import * as crypto from 'crypto';
import { createTwitchMappingPrismaMock } from '../../twitch-mapping/test/mocks/twitch-mapping.prisma.mock';
import { createMockTwitchMappingWithEvent } from '../../twitch-mapping/test/fixtures/twitch-mapping.fixture';

describe('TwitchService', () => {
  let service: TwitchService;

  const WEBHOOK_SECRET = 'test-webhook-secret';

  const mockPrisma = createTwitchMappingPrismaMock();

  const mockRedisService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  const mockTwitchMappingRepository = {
    getActiveMappingsByType: jest
      .fn()
      .mockResolvedValue([createMockTwitchMappingWithEvent()]),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        TWITCH_WEBHOOK_SECRET: WEBHOOK_SECRET,
        TWITCH_CLIENT_ID: 'client-id',
        TWITCH_CLIENT_SECRET: 'client-secret',
        TWITCH_WEBHOOK_CALLBACK_URL: 'https://example.com/twitch/webhook',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitchService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedisService },
        {
          provide: TwitchMappingRepository,
          useValue: mockTwitchMappingRepository,
        },
      ],
    }).compile();

    service = module.get(TwitchService);
    jest.clearAllMocks();
  });

  describe('validateHmac', () => {
    it('should return true for valid HMAC signature', () => {
      const messageId = 'msg-123';
      const timestamp = '2024-01-01T00:00:00Z';
      const body = '{"test":"payload"}';
      const message = messageId + timestamp + body;
      const signature =
        'sha256=' +
        crypto
          .createHmac('sha256', WEBHOOK_SECRET)
          .update(message)
          .digest('hex');

      const result = service.validateHmac(
        messageId,
        timestamp,
        body,
        signature,
      );

      expect(result).toBe(true);
    });

    it('should return false for invalid HMAC signature', () => {
      const result = service.validateHmac(
        'msg-123',
        '2024-01-01T00:00:00Z',
        '{"test":"payload"}',
        'sha256=' + 'a'.repeat(64),
      );

      expect(result).toBe(false);
    });
  });

  describe('handleWebhook', () => {
    it('should return challenge on webhook_callback_verification', async () => {
      const result = await service.handleWebhook({
        messageId: 'msg-123',
        timestamp: '2024-01-01',
        rawBody: '{"challenge":"abc123"}',
        signature: 'sha256=anything',
        messageType: 'webhook_callback_verification',
      });

      expect(result).toEqual({ challenge: 'abc123' });
    });

    it('should return empty on revocation', async () => {
      const result = await service.handleWebhook({
        messageId: 'msg-123',
        timestamp: '2024-01-01',
        rawBody: '{"subscription":{"type":"channel.subscribe"}}',
        signature: 'sha256=anything',
        messageType: 'revocation',
      });

      expect(result).toEqual({});
    });

    it('should throw UnauthorizedException on invalid HMAC', async () => {
      await expect(
        service.handleWebhook({
          messageId: 'msg-123',
          timestamp: '2024-01-01',
          rawBody: '{"subscription":{"type":"channel.subscribe"},"event":{}}',
          signature: 'sha256=' + 'a'.repeat(64),
          messageType: 'notification',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should create SessionEvent on valid SUB notification', async () => {
      const body = JSON.stringify({
        subscription: { type: 'channel.subscribe' },
        event: {
          broadcaster_user_id: '123456789',
          tier: '1000',
          is_gift: false,
        },
      });
      const messageId = 'msg-123';
      const timestamp = '2024-01-01T00:00:00Z';
      const message = messageId + timestamp + body;
      const signature =
        'sha256=' +
        crypto
          .createHmac('sha256', WEBHOOK_SECRET)
          .update(message)
          .digest('hex');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twitchId: '123456789',
      });
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'session-123',
        campaignId: 'campaign-123',
      });
      mockTwitchMappingRepository.getActiveMappingsByType.mockResolvedValue([
        createMockTwitchMappingWithEvent(),
      ]);

      await service.handleWebhook({
        messageId,
        timestamp,
        rawBody: body,
        signature,
        messageType: 'notification',
      });

      expect(mockPrisma.sessionEvent.create).toHaveBeenCalled();
      expect(mockRedisService.publish).toHaveBeenCalledWith(
        'session:session-123:event:pending',
        expect.objectContaining({ triggerType: TriggerType.SUB_TIER1 }),
      );
    });

    it('should not create SessionEvent when no active mappings', async () => {
      const body = JSON.stringify({
        subscription: { type: 'channel.subscribe' },
        event: { broadcaster_user_id: '123456789', tier: '1000' },
      });
      const messageId = 'msg-123';
      const timestamp = '2024-01-01T00:00:00Z';
      const message = messageId + timestamp + body;
      const signature =
        'sha256=' +
        crypto
          .createHmac('sha256', WEBHOOK_SECRET)
          .update(message)
          .digest('hex');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twitchId: '123456789',
      });
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'session-123',
        campaignId: 'campaign-123',
      });
      mockTwitchMappingRepository.getActiveMappingsByType.mockResolvedValue([]);

      await service.handleWebhook({
        messageId,
        timestamp,
        rawBody: body,
        signature,
        messageType: 'notification',
      });

      expect(mockPrisma.sessionEvent.create).not.toHaveBeenCalled();
    });

    it('should not create SessionEvent when no active session', async () => {
      const body = JSON.stringify({
        subscription: { type: 'channel.subscribe' },
        event: { broadcaster_user_id: '123456789', tier: '1000' },
      });
      const messageId = 'msg-123';
      const timestamp = '2024-01-01T00:00:00Z';
      const message = messageId + timestamp + body;
      const signature =
        'sha256=' +
        crypto
          .createHmac('sha256', WEBHOOK_SECRET)
          .update(message)
          .digest('hex');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twitchId: '123456789',
      });
      mockPrisma.session.findFirst.mockResolvedValue(null);

      await service.handleWebhook({
        messageId,
        timestamp,
        rawBody: body,
        signature,
        messageType: 'notification',
      });

      expect(mockPrisma.sessionEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('mapToTriggerType', () => {
    const cases = [
      {
        type: 'channel.subscribe',
        event: { tier: '1000' },
        expected: TriggerType.SUB_TIER1,
      },
      {
        type: 'channel.subscribe',
        event: { tier: '2000' },
        expected: TriggerType.SUB_TIER2,
      },
      {
        type: 'channel.subscribe',
        event: { tier: '3000' },
        expected: TriggerType.SUB_TIER3,
      },
      {
        type: 'channel.subscribe',
        event: { tier: 'prime' },
        expected: TriggerType.SUB_PRIME,
      },
      {
        type: 'channel.subscription.gift',
        event: {},
        expected: TriggerType.GIFT_SUB,
      },
      { type: 'channel.cheer', event: {}, expected: TriggerType.BITS },
      { type: 'channel.raid', event: {}, expected: TriggerType.RAID },
      { type: 'channel.follow', event: {}, expected: TriggerType.FOLLOW },
    ];

    it.each(cases)(
      'should map $type (tier: $event.tier) to $expected',
      ({ type, event, expected }) => {
        const result = (service as any).mapToTriggerType(type, event) as string;
        expect(result).toBe(expected);
      },
    );

    it('should return null for unknown subscription type', () => {
      const result = (service as any).mapToTriggerType(
        'channel.unknown',
        {},
      ) as string | null;
      expect(result).toBeNull();
    });
  });
});
