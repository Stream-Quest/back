import { Injectable } from '@nestjs/common';
import { CampaignEvent, Prisma } from '../generated/prisma/client';
import {
  CampaignEventFindManyArgs,
  CampaignEventOrderByWithRelationInput,
  CampaignEventWhereInput,
  CampaignEventWhereUniqueInput,
} from '../generated/prisma/models';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../helpers/pagination.helper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignEventDto } from './dto/event/create-campaign-event.dto';

export type CampaignEventWithEvent = Prisma.CampaignEventGetPayload<{
  include: {
    event: {
      include: {
        rules: true;
        resolutions: true;
      };
    };
  };
}>;

@Injectable()
export class CampaignEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignEventList(
    where: CampaignEventWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: CampaignEventOrderByWithRelationInput;
    },
  ): Promise<CampaignEvent[]> {
    return await paginatedFindMany<CampaignEvent>(
      () =>
        this.prisma.campaignEvent.findMany({
          ...buildPaginationArgs<CampaignEventFindManyArgs>(options),
          where,
        }),
      options?.direction,
    );
  }

  async getCampaignEvent(
    where: CampaignEventWhereUniqueInput,
  ): Promise<CampaignEventWithEvent | null> {
    return await this.prisma.campaignEvent.findUnique({
      where,
      include: {
        event: {
          include: {
            rules: true,
            resolutions: true,
          },
        },
      },
    });
  }

  async createCampaignEvent(
    dto: CreateCampaignEventDto,
    campaignId: string,
  ): Promise<CampaignEvent> {
    return await this.prisma.campaignEvent.create({
      data: {
        isActive: dto.isActive ?? true,
        campaign: { connect: { id: campaignId } },
        event: { connect: { id: dto.eventId } },
      },
    });
  }

  async updateCampaignEvent(
    where: CampaignEventWhereUniqueInput,
    data: { isActive: boolean },
  ): Promise<CampaignEvent> {
    return await this.prisma.campaignEvent.update({ where, data });
  }

  async deleteCampaignEvent(
    where: CampaignEventWhereUniqueInput,
  ): Promise<CampaignEvent> {
    return await this.prisma.campaignEvent.delete({ where });
  }
}
