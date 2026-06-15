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
import { Campaign } from '../generated/prisma/client';
import { paginatedFindMany } from '../helpers/pagination.helper';

@Injectable()
export class CampaignRepository {
  private readonly includeCount = {
    _count: {
      select: {
        sessions: true,
        campaignEvents: true,
      },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getCampaignList(
    where: CampaignWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: CampaignOrderByWithRelationInput;
    },
  ): Promise<Campaign[]> {
    return paginatedFindMany<Campaign, CampaignFindManyArgs>(
      (args) => this.prisma.campaign.findMany(args),
      { ...options, where, include: this.includeCount },
    );
  }

  async getCampaign(where: CampaignWhereInput): Promise<Campaign | null> {
    return this.prisma.campaign.findFirst({
      where,
      include: this.includeCount,
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
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async updateCampaignStatus(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async updateCampaignKarma(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async softRemoveCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async restoreSoftRemovedCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
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
  ): Promise<Campaign> {
    return this.prisma.campaign.update({
      where,
      data,
      include: this.includeCount,
    });
  }
}
