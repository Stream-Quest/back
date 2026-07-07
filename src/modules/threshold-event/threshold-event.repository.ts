import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CampaignThresholdEventFindManyArgs,
  CampaignThresholdEventOrderByWithRelationInput,
  CampaignThresholdEventWhereInput,
  CampaignThresholdEventWhereUniqueInput,
} from '../../generated/prisma/models';
import {
  CampaignThresholdEvent,
  Prisma,
  ThresholdType,
} from '../../generated/prisma/client';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../../helpers/pagination.helper';
import { CreateThresholdEventDto } from './dto/create-threshold-event.dto';
import { UpdateThresholdEventDto } from './dto/update-threshold-event.dto';

export type ThresholdEventWithEvent = Prisma.CampaignThresholdEventGetPayload<{
  include: {
    event: true;
  };
}>;

@Injectable()
export class ThresholdEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getThresholdEventList(
    where: CampaignThresholdEventWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: CampaignThresholdEventOrderByWithRelationInput;
    },
  ): Promise<CampaignThresholdEvent[]> {
    return await paginatedFindMany<CampaignThresholdEvent>(
      () =>
        this.prisma.campaignThresholdEvent.findMany({
          ...buildPaginationArgs<CampaignThresholdEventFindManyArgs>(options),
          where,
        }),
      options?.direction,
    );
  }

  async getThresholdEvent(
    where: CampaignThresholdEventWhereUniqueInput,
  ): Promise<ThresholdEventWithEvent | null> {
    return await this.prisma.campaignThresholdEvent.findUnique({
      where,
      include: { event: true },
    });
  }

  async getThresholdEventsByType(
    campaignId: string,
    thresholdType: ThresholdType,
  ): Promise<ThresholdEventWithEvent[]> {
    return await this.prisma.campaignThresholdEvent.findMany({
      where: { campaignId, thresholdType },
      include: { event: true },
    });
  }

  async createThresholdEvent(
    dto: CreateThresholdEventDto,
    campaignId: string,
  ): Promise<CampaignThresholdEvent> {
    return await this.prisma.campaignThresholdEvent.create({
      data: {
        thresholdType: dto.thresholdType,
        campaign: { connect: { id: campaignId } },
        event: { connect: { id: dto.eventId } },
      },
    });
  }

  async updateThresholdEvent(
    where: CampaignThresholdEventWhereUniqueInput,
    dto: UpdateThresholdEventDto,
  ): Promise<CampaignThresholdEvent> {
    return await this.prisma.campaignThresholdEvent.update({
      where,
      data: {
        ...(dto.thresholdType && { thresholdType: dto.thresholdType }),
        ...(dto.eventId && { event: { connect: { id: dto.eventId } } }),
      },
    });
  }

  async deleteThresholdEvent(
    where: CampaignThresholdEventWhereUniqueInput,
  ): Promise<CampaignThresholdEvent> {
    return await this.prisma.campaignThresholdEvent.delete({ where });
  }
}
