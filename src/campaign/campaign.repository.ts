import { Injectable } from '@nestjs/common';
import {
  CampaignCreateInput,
  CampaignFindManyArgs,
  CampaignOrderByWithRelationInput,
  CampaignUpdateInput,
  CampaignWhereInput,
  CampaignWhereUniqueInput,
} from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { Campaign, Prisma } from '../generated/prisma/client';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../helpers/pagination.helper';

export type CampaignWithCount = Prisma.CampaignGetPayload<{
  include: {
    _count: {
      select: {
        sessions: true;
        campaignEvents: true;
      };
    };
  };
}>;

const CAMPAIGN_INCLUDE_COUNT = {
  _count: {
    select: {
      sessions: true,
      campaignEvents: true,
    },
  },
} satisfies Prisma.CampaignInclude;

@Injectable()
export class CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignList(
    where: CampaignWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: CampaignOrderByWithRelationInput;
    },
  ): Promise<CampaignWithCount[]> {
    return paginatedFindMany<CampaignWithCount>(
      () =>
        this.prisma.campaign.findMany({
          ...buildPaginationArgs<CampaignFindManyArgs>(options),
          where,
          include: CAMPAIGN_INCLUDE_COUNT,
        }),
      options?.direction,
    );
  }

  async getCampaign(
    where: CampaignWhereInput,
  ): Promise<CampaignWithCount | null> {
    return this.prisma.campaign.findFirst({
      where,
      include: CAMPAIGN_INCLUDE_COUNT,
    });
  }

  async createCampaign(data: CampaignCreateInput): Promise<Campaign> {
    return this.prisma.campaign.create({
      data,
    });
  }

  async updateCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignWithCount> {
    return this.prismaUpdate(where, data);
  }

  async updateCampaignStatus(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignWithCount> {
    return this.prismaUpdate(where, data);
  }

  async updateCampaignKarma(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignWithCount> {
    return this.prismaUpdate(where, data);
  }

  async softRemoveCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignWithCount> {
    return this.prismaUpdate(where, data);
  }

  async restoreSoftRemovedCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignWithCount> {
    return this.prismaUpdate(where, data);
  }

  async deleteCampaign(where: CampaignWhereUniqueInput): Promise<Campaign> {
    return this.prisma.campaign.delete({
      where,
    });
  }

  private async prismaUpdate(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignWithCount> {
    return this.prisma.campaign.update({
      where,
      data,
      include: CAMPAIGN_INCLUDE_COUNT,
    });
  }
}
