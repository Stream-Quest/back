import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PlayerCharacterFindManyArgs,
  PlayerCharacterOrderByWithRelationInput,
  PlayerCharacterUpdateInput,
  PlayerCharacterWhereUniqueInput,
} from '../../generated/prisma/models';
import { PlayerCharacter } from '../../generated/prisma/client';
import { CreatePlayerCharacterDto } from './dto/create-player-character.dto';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../../helpers/pagination.helper';

@Injectable()
export class PlayerCharacterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayerCharacterList(
    where: { campaignId?: string },
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: PlayerCharacterOrderByWithRelationInput;
    },
  ): Promise<PlayerCharacter[]> {
    return paginatedFindMany<PlayerCharacter>(
      () =>
        this.prisma.playerCharacter.findMany({
          ...buildPaginationArgs<PlayerCharacterFindManyArgs>(options),
          where: {
            ...(where.campaignId && { campaignId: where.campaignId }),
          },
        }),
      options?.direction,
    );
  }

  async getPlayerCharacter(
    where: PlayerCharacterWhereUniqueInput,
  ): Promise<PlayerCharacter | null> {
    return await this.prisma.playerCharacter.findUnique({ where });
  }

  async createPlayerCharacter(
    dto: CreatePlayerCharacterDto,
  ): Promise<PlayerCharacter> {
    const { campaignId, ...data } = dto;

    return await this.prisma.playerCharacter.create({
      data: {
        ...data,
        campaign: {
          connect: { id: campaignId },
        },
      },
    });
  }

  async updatePlayerCharacter(
    where: PlayerCharacterWhereUniqueInput,
    data: PlayerCharacterUpdateInput,
  ): Promise<PlayerCharacter> {
    return await this.prisma.playerCharacter.update({
      where,
      data,
    });
  }

  async deletePlayerCharacter(
    where: PlayerCharacterWhereUniqueInput,
  ): Promise<PlayerCharacter> {
    return await this.prisma.playerCharacter.delete({ where });
  }
}
