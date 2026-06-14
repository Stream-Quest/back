import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PlayerCharacterOrderByWithRelationInput,
  PlayerCharacterUpdateInput,
  PlayerCharacterWhereUniqueInput,
} from '../generated/prisma/models';
import { PlayerCharacter } from '../generated/prisma/client';
import { CreatePlayerCharacterDto } from './dto/create-player-character.dto';

@Injectable()
export class PlayerCharacterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayerCharacterList(options?: {
    take?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: PlayerCharacterOrderByWithRelationInput;
  }): Promise<PlayerCharacter[]> {
    const isBackward = options?.direction === 'backward';
    const take = options?.take || 10;

    const result = await this.prisma.playerCharacter.findMany({
      take: isBackward ? -take : take,
      ...(options?.cursor && {
        skip: 1,
        cursor: { id: options.cursor },
      }),
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });

    return isBackward ? result.reverse() : result;
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
