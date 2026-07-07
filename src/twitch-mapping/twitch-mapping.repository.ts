import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TwitchEventMapping, TriggerType } from '../generated/prisma/client';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../helpers/pagination.helper';
import {
  TwitchEventMappingFindManyArgs,
  TwitchEventMappingGetPayload,
  TwitchEventMappingOrderByWithRelationInput,
  TwitchEventMappingWhereInput,
  TwitchEventMappingWhereUniqueInput,
} from '../generated/prisma/models';
import { CreateTwitchMappingDto } from './dto/create-twitch-mapping.dto';
import { UpdateTwitchMappingDto } from './dto/update-twitch-mapping.dto';

export type TwitchMappingWithEvent = TwitchEventMappingGetPayload<{
  include: { event: true };
}>;

@Injectable()
export class TwitchMappingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTwitchMappingList(
    where: TwitchEventMappingWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: TwitchEventMappingOrderByWithRelationInput;
    },
  ): Promise<TwitchEventMapping[]> {
    return await paginatedFindMany<TwitchEventMapping>(
      () =>
        this.prisma.twitchEventMapping.findMany({
          ...buildPaginationArgs<TwitchEventMappingFindManyArgs>(options),
          where,
        }),
      options?.direction,
    );
  }

  async getTwitchMapping(
    where: TwitchEventMappingWhereUniqueInput,
  ): Promise<TwitchMappingWithEvent | null> {
    return await this.prisma.twitchEventMapping.findUnique({
      where,
      include: { event: true },
    });
  }

  async getActiveMappingsByType(
    campaignId: string,
    twitchEventType: TriggerType,
  ): Promise<TwitchMappingWithEvent[]> {
    return await this.prisma.twitchEventMapping.findMany({
      where: { campaignId, twitchEventType, isActive: true },
      include: { event: true },
    });
  }

  async createTwitchMapping(
    dto: CreateTwitchMappingDto,
    campaignId: string,
  ): Promise<TwitchEventMapping> {
    return await this.prisma.twitchEventMapping.create({
      data: {
        twitchEventType: dto.twitchEventType,
        isActive: dto.isActive ?? true,
        campaign: { connect: { id: campaignId } },
        event: { connect: { id: dto.eventId } },
      },
    });
  }

  async updateTwitchMapping(
    where: TwitchEventMappingWhereUniqueInput,
    dto: UpdateTwitchMappingDto,
  ): Promise<TwitchEventMapping> {
    return await this.prisma.twitchEventMapping.update({
      where,
      data: {
        ...(dto.twitchEventType && { twitchEventType: dto.twitchEventType }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.eventId && { event: { connect: { id: dto.eventId } } }),
      },
    });
  }

  async deleteTwitchMapping(
    where: TwitchEventMappingWhereUniqueInput,
  ): Promise<TwitchEventMapping> {
    return await this.prisma.twitchEventMapping.delete({ where });
  }
}
