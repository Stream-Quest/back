import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  KarmaEventFindManyArgs,
  KarmaEventOrderByWithRelationInput,
  KarmaEventWhereInput,
  KarmaEventWhereUniqueInput,
} from '../generated/prisma/models';
import { KarmaEvent } from '../generated/prisma/client';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../helpers/pagination.helper';

@Injectable()
export class KarmaEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getKarmaEventList(
    where: KarmaEventWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: KarmaEventOrderByWithRelationInput;
    },
  ): Promise<KarmaEvent[]> {
    return await paginatedFindMany<KarmaEvent>(
      () =>
        this.prisma.karmaEvent.findMany({
          ...buildPaginationArgs<KarmaEventFindManyArgs>(options),
          where,
        }),
      options?.direction,
    );
  }

  async getKarmaEvent(
    where: KarmaEventWhereUniqueInput,
  ): Promise<KarmaEvent | null> {
    return await this.prisma.karmaEvent.findUnique({ where });
  }

  async createKarmaEvent(data: {
    value: number;
    reason?: string;
    campaignId: string;
    sessionId?: string;
  }): Promise<KarmaEvent> {
    return await this.prisma.karmaEvent.create({
      data: {
        value: data.value,
        reason: data.reason,
        occurredAt: new Date(),
        campaign: { connect: { id: data.campaignId } },
        ...(data.sessionId && {
          session: { connect: { id: data.sessionId } },
        }),
      },
    });
  }

  async incrementCampaignKarma(
    campaignId: string,
    value: number,
  ): Promise<{
    karmaValue: number;
    chaosThreshold: number;
    blessingThreshold: number;
  }> {
    return await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { karmaValue: { increment: value } },
      select: {
        karmaValue: true,
        chaosThreshold: true,
        blessingThreshold: true,
      },
    });
  }
}
