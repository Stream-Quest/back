import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TwitchMappingRepository } from '../twitch-mapping/twitch-mapping.repository';
import { SessionStatus, TriggerType } from '../generated/prisma/client';
import * as crypto from 'crypto';

type TriggerTypeValue = (typeof TriggerType)[keyof typeof TriggerType];

interface TwitchWebhookParams {
  messageId: string;
  timestamp: string;
  rawBody: string;
  signature: string;
  messageType: string;
}

interface SessionLike {
  id: string;
  campaignId: string;
}

@Injectable()
export class TwitchService {
  private readonly logger = new Logger(TwitchService.name);

  private readonly webhookSecret: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly twitchMappingRepository: TwitchMappingRepository,
  ) {
    this.webhookSecret = this.configService.get<string>(
      'TWITCH_WEBHOOK_SECRET',
    )!;
    this.clientId = this.configService.get<string>('TWITCH_CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>('TWITCH_CLIENT_SECRET')!;
    this.callbackUrl = this.configService.get<string>(
      'TWITCH_WEBHOOK_CALLBACK_URL',
    )!;
  }

  async handleWebhook(
    params: TwitchWebhookParams,
  ): Promise<{ challenge?: string }> {
    const { messageId, timestamp, rawBody, signature, messageType } = params;
    const payload = JSON.parse(rawBody) as Record<string, unknown>;

    if (messageType === 'webhook_callback_verification') {
      this.logger.log('Twitch challenge received');
      return { challenge: payload.challenge as string };
    }

    if (messageType === 'revocation') {
      const subType = this.extractSubscriptionType(payload);
      this.logger.warn(`Subscription revoked: ${subType}`);
      return {};
    }

    if (!this.validateHmac(messageId, timestamp, rawBody, signature)) {
      throw new UnauthorizedException('Invalid Twitch webhook signature');
    }

    await this.processEvent(payload);
    return {};
  }

  async onSessionStart(sessionId: string, gmId: string): Promise<void> {
    const broadcasterIds = await this.getSessionBroadcasterIds(sessionId, gmId);
    if (broadcasterIds.length > 0) {
      await this.createEventSubSubscriptions(sessionId, broadcasterIds);
    }
  }

  async onSessionEnd(sessionId: string, gmId: string): Promise<void> {
    const broadcasterIds = await this.getSessionBroadcasterIds(sessionId, gmId);
    if (broadcasterIds.length > 0) {
      await this.deleteEventSubSubscriptions(broadcasterIds);
    }
  }

  validateHmac(
    messageId: string,
    timestamp: string,
    body: string,
    signature: string,
  ): boolean {
    const expected =
      'sha256=' +
      crypto
        .createHmac('sha256', this.webhookSecret)
        .update(messageId + timestamp + body)
        .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  }

  private async processEvent(payload: Record<string, unknown>): Promise<void> {
    const subscriptionType = this.extractSubscriptionType(payload);
    const event = payload.event as Record<string, unknown> | undefined;
    const broadcasterId = this.extractBroadcasterId(
      subscriptionType as string,
      event ?? {},
    );

    this.logger.log(`Full payload: ${JSON.stringify(payload)}`);

    this.logger.log(
      `Processing event: ${subscriptionType} for broadcaster: ${broadcasterId}`,
    );

    const user = await this.prisma.user.findUnique({
      where: { twitchId: broadcasterId },
    });

    this.logger.log(`User found: ${user?.id ?? 'null'}`);

    if (!subscriptionType || !broadcasterId) {
      this.logger.warn('Missing subscription type or broadcaster ID');
      return;
    }

    const triggerType = this.mapToTriggerType(subscriptionType, event ?? {});
    if (!triggerType) {
      this.logger.log(`Unhandled subscription type: ${subscriptionType}`);
      return;
    }

    const session = await this.findActiveSession(broadcasterId);
    if (!session) {
      this.logger.log(`No active session for broadcaster: ${broadcasterId}`);
      return;
    }

    await this.dispatchEvent(session, triggerType, event ?? {});
  }

  private async dispatchEvent(
    session: SessionLike,
    triggerType: TriggerTypeValue,
    event: Record<string, unknown>,
  ): Promise<void> {
    const mappings = await this.twitchMappingRepository.getActiveMappingsByType(
      session.campaignId,
      triggerType,
    );

    if (mappings.length === 0) {
      this.logger.log(
        `No active mappings for ${triggerType} in campaign ${session.campaignId}`,
      );
      return;
    }

    const mapping = mappings[Math.floor(Math.random() * mappings.length)];

    const sessionEvent = await this.prisma.sessionEvent.create({
      data: {
        session: { connect: { id: session.id } },
        event: { connect: { id: mapping.eventId } },
        triggeredAt: new Date(),
      },
    });

    await this.redisService.publish(`session:${session.id}:event:pending`, {
      sessionEventId: sessionEvent.id,
      eventId: sessionEvent.eventId,
      triggeredAt: sessionEvent.triggeredAt,
      triggerType,
      twitchPayload: {
        userId: event.user_id,
        userLogin: event.user_login,
        tier: event.tier,
        bits: event.bits,
        viewers: event.viewers,
      },
    });

    this.logger.log(
      `SessionEvent ${sessionEvent.id} created for trigger ${triggerType}`,
    );
  }

  private async findActiveSession(
    broadcasterId: string,
  ): Promise<SessionLike | null> {
    const user = await this.prisma.user.findUnique({
      where: { twitchId: broadcasterId },
    });

    if (!user) return null;

    const gmSession = await this.prisma.session.findFirst({
      where: {
        status: SessionStatus.LIVE,
        campaign: { gameMasterId: user.id },
      },
    });

    if (gmSession) return gmSession;

    return await this.prisma.session.findFirst({
      where: {
        status: SessionStatus.LIVE,
        sessionStreamers: { some: { userId: user.id } },
      },
    });
  }

  private async getSessionBroadcasterIds(
    sessionId: string,
    gmId: string,
  ): Promise<string[]> {
    const [gm, streamers] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: gmId },
        select: { twitchId: true },
      }),
      this.prisma.sessionStreamer.findMany({
        where: { sessionId },
        include: { user: { select: { twitchId: true } } },
      }),
    ]);

    const gmId_: string[] = gm?.twitchId ? [gm.twitchId] : [];
    const streamerIds: string[] = streamers
      .map((streamer) => streamer.user.twitchId)
      .filter((id): id is string => typeof id === 'string');

    return [...gmId_, ...streamerIds];
  }

  private async createEventSubSubscriptions(
    sessionId: string,
    broadcasterIds: string[],
  ): Promise<void> {
    const appToken = await this.getAppAccessToken();
    const eventTypes = [
      'channel.subscribe',
      'channel.subscription.gift',
      'channel.cheer',
      'channel.raid',
      'channel.follow',
    ];

    const tasks = broadcasterIds.flatMap((broadcasterId) =>
      eventTypes.map((eventType) =>
        this.createSubscription(appToken, eventType, broadcasterId).catch(
          (error) => {
            this.logger.error(
              `Failed to create subscription ${eventType} for ${broadcasterId}`,
              error,
            );
          },
        ),
      ),
    );

    await Promise.allSettled(tasks);
    this.logger.log(`EventSub subscriptions created for session ${sessionId}`);
  }

  private async deleteEventSubSubscriptions(
    broadcasterIds: string[],
  ): Promise<void> {
    const appToken = await this.getAppAccessToken();
    const subscriptions = await this.fetchActiveSubscriptions(appToken);

    const tasks = subscriptions
      .filter((sub) => {
        const condition = sub.condition as Record<string, unknown> | undefined;
        const id = condition?.broadcaster_user_id as string | undefined;
        return id && broadcasterIds.includes(id);
      })
      .map((sub) =>
        this.deleteSubscription(appToken, sub.id as string).catch((error) => {
          this.logger.error(
            `Failed to delete subscription ${sub.id as string}`,
            error,
          );
        }),
      );

    await Promise.allSettled(tasks);
  }

  private async fetchActiveSubscriptions(
    appToken: string,
  ): Promise<Record<string, unknown>[]> {
    const response = await fetch(
      'https://api.twitch.tv/helix/eventsub/subscriptions',
      {
        headers: {
          'Client-Id': this.clientId,
          Authorization: `Bearer ${appToken}`,
        },
      },
    );

    const data = (await response.json()) as Record<string, unknown>;
    return (data.data as Record<string, unknown>[]) ?? [];
  }

  private async createSubscription(
    appToken: string,
    eventType: string,
    broadcasterId: string,
  ): Promise<void> {
    const condition: Record<string, string> =
      eventType === 'channel.raid'
        ? { to_broadcaster_user_id: broadcasterId }
        : { broadcaster_user_id: broadcasterId };

    await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      headers: {
        'Client-Id': this.clientId,
        Authorization: `Bearer ${appToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: eventType,
        version: '1',
        condition,
        transport: {
          method: 'webhook',
          callback: this.callbackUrl,
          secret: this.webhookSecret,
        },
      }),
    });
  }

  private async deleteSubscription(
    appToken: string,
    subscriptionId: string,
  ): Promise<void> {
    await fetch(
      `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,
      {
        method: 'DELETE',
        headers: {
          'Client-Id': this.clientId,
          Authorization: `Bearer ${appToken}`,
        },
      },
    );
  }

  private async getAppAccessToken(): Promise<string> {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;
    return data.access_token as string;
  }

  private extractSubscriptionType(
    payload: Record<string, unknown>,
  ): string | undefined {
    const subscription = payload.subscription as
      | Record<string, unknown>
      | undefined;
    return subscription?.type as string | undefined;
  }

  private extractBroadcasterId(
    subscriptionType: string,
    event: Record<string, unknown>,
  ): string | undefined {
    if (subscriptionType === 'channel.raid') {
      return event.to_broadcaster_user_id as string | undefined;
    }
    return event.broadcaster_user_id as string | undefined;
  }

  private mapToTriggerType(
    subscriptionType: string,
    event: Record<string, unknown>,
  ): TriggerTypeValue | null {
    switch (subscriptionType) {
      case 'channel.subscribe': {
        const tier = event.tier as string | undefined;
        if (tier === 'prime' || tier === 'Prime') return 'SUB_PRIME' as const;
        if (tier === '3000') return 'SUB_TIER3' as const;
        if (tier === '2000') return 'SUB_TIER2' as const;
        return 'SUB_TIER1' as const;
      }
      case 'channel.subscription.gift':
        return 'GIFT_SUB' as const;
      case 'channel.cheer':
        return 'BITS' as const;
      case 'channel.raid':
        return 'RAID' as const;
      case 'channel.follow':
        return 'FOLLOW' as const;
      default:
        return null;
    }
  }
}
