import { Injectable, NotFoundException } from '@nestjs/common';
import { KarmaEventRepository } from './karma-event.repository';
import { ThresholdEventRepository } from './threshold-event.repository';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { paginate } from '../helpers/pagination.helper';
import { KarmaEvent, ThresholdType } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { KarmaEventQueryDto } from './dto/karma/karma-event-query.dto';
import { KarmaEventResponseDto } from './dto/karma/karma-event-response.dto';

@Injectable()
export class KarmaEventService {
  constructor(
    private readonly karmaRepository: KarmaEventRepository,
    private readonly thresholdEventRepository: ThresholdEventRepository,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getKarmaEventList(
    campaignId: string,
    queryDto: KarmaEventQueryDto,
  ): Promise<PaginationResponseDto<KarmaEventResponseDto>> {
    const events = await this.karmaRepository.getKarmaEventList(
      {
        campaignId,
        ...(queryDto.sessionId && { sessionId: queryDto.sessionId }),
      },
      {
        take: (queryDto.limit || 10) + 1,
        cursor: queryDto.cursor,
        direction: queryDto.direction,
        orderBy: { occurredAt: 'desc' },
      },
    );

    return paginate(events, queryDto);
  }

  async getKarmaEvent(id: string): Promise<KarmaEventResponseDto> {
    const karmaEvent = await this.karmaRepository.getKarmaEvent({ id });

    if (!karmaEvent) {
      throw new NotFoundException('KarmaEvent not found');
    }

    return karmaEvent;
  }

  async applyKarma(params: {
    campaignId: string;
    value: number;
    reason: string;
    sessionId?: string;
  }): Promise<{ karmaEvent: KarmaEvent; newKarmaValue: number }> {
    const { campaignId, value, reason, sessionId } = params;

    const karmaEvent = await this.karmaRepository.createKarmaEvent({
      value,
      reason,
      campaignId,
      sessionId,
    });

    const updatedCampaign = await this.karmaRepository.incrementCampaignKarma(
      campaignId,
      value,
    );

    const newKarmaValue = updatedCampaign.karmaValue;

    await this.redisService.publish(`campaign:${campaignId}:karma-updated`, {
      karmaEventId: karmaEvent.id,
      value,
      newKarmaValue,
      reason,
    });

    if (sessionId) {
      await this.checkThresholds({
        campaignId,
        sessionId,
        newKarmaValue,
        chaosThreshold: updatedCampaign.chaosThreshold,
        blessingThreshold: updatedCampaign.blessingThreshold,
      });
    }

    return { karmaEvent, newKarmaValue };
  }

  private async checkThresholds(params: {
    campaignId: string;
    sessionId: string;
    newKarmaValue: number;
    chaosThreshold: number;
    blessingThreshold: number;
  }): Promise<void> {
    const {
      campaignId,
      sessionId,
      newKarmaValue,
      chaosThreshold,
      blessingThreshold,
    } = params;

    const triggeredTypes: ThresholdType[] = [];

    if (newKarmaValue <= chaosThreshold) {
      triggeredTypes.push(ThresholdType.CHAOS);
    }

    if (newKarmaValue >= blessingThreshold) {
      triggeredTypes.push(ThresholdType.BLESSING);
    }

    for (const thresholdType of triggeredTypes) {
      const thresholdEvents =
        await this.thresholdEventRepository.getThresholdEventsByType(
          campaignId,
          thresholdType,
        );

      for (const thresholdEvent of thresholdEvents) {
        // Créer un SessionEvent (PENDING) lié au ThresholdEvent
        const sessionEvent = await this.prisma.sessionEvent.create({
          data: {
            session: { connect: { id: sessionId } },
            event: { connect: { id: thresholdEvent.eventId } },
            thresholdEvent: { connect: { id: thresholdEvent.id } },
            triggeredAt: new Date(),
          },
        });

        // Broadcast au GM Dashboard
        await this.redisService.publish(`session:${sessionId}:event:pending`, {
          sessionEventId: sessionEvent.id,
          eventId: sessionEvent.eventId,
          triggeredAt: sessionEvent.triggeredAt,
          thresholdType,
          thresholdEventId: thresholdEvent.id,
        });
      }
    }
  }
}
