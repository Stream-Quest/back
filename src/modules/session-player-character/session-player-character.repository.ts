import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, SessionPlayerCharacter } from '../../generated/prisma/client';
import { UpdateSessionPlayerCharacterDto } from './dto/update-session-player-character.dto';

export type SessionPlayerCharacterWithDetails =
  Prisma.SessionPlayerCharacterGetPayload<{
    include: {
      playerCharacter: {
        select: {
          id: true;
          name: true;
          class: true;
          level: true;
          maxHp: true;
          armorClass: true;
          avatarUrl: true;
          isAlive: true;
          displayAvatar: true;
          displayClass: true;
          displayLevel: true;
          displayHp: true;
          displayArmorClass: true;
          displayStatus: true;
        };
      };
    };
  }>;

@Injectable()
export class SessionPlayerCharacterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionPlayerCharacterList(
    sessionId: string,
  ): Promise<SessionPlayerCharacterWithDetails[]> {
    return await this.prisma.sessionPlayerCharacter.findMany({
      where: { sessionId, leftAt: null },
      include: {
        playerCharacter: {
          select: {
            id: true,
            name: true,
            class: true,
            level: true,
            maxHp: true,
            armorClass: true,
            avatarUrl: true,
            isAlive: true,
            displayAvatar: true,
            displayClass: true,
            displayLevel: true,
            displayHp: true,
            displayArmorClass: true,
            displayStatus: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async getSessionPlayerCharacter(
    id: string,
  ): Promise<SessionPlayerCharacter | null> {
    return await this.prisma.sessionPlayerCharacter.findUnique({
      where: { id },
    });
  }

  async getPlayerCharacterWithMaxHp(
    playerCharacterId: string,
  ): Promise<{ maxHp: number | null } | null> {
    return await this.prisma.playerCharacter.findUnique({
      where: { id: playerCharacterId },
      select: { maxHp: true },
    });
  }

  async createSessionPlayerCharacter(
    sessionId: string,
    playerCharacterId: string,
    currentHp: number | null,
  ): Promise<SessionPlayerCharacter> {
    return await this.prisma.sessionPlayerCharacter.create({
      data: {
        session: { connect: { id: sessionId } },
        playerCharacter: { connect: { id: playerCharacterId } },
        joinedAt: new Date(),
        currentHp,
      },
    });
  }

  async updateSessionPlayerCharacter(
    id: string,
    dto: UpdateSessionPlayerCharacterDto,
  ): Promise<SessionPlayerCharacter> {
    return await this.prisma.sessionPlayerCharacter.update({
      where: { id },
      data: {
        ...(dto.currentHp !== undefined && { currentHp: dto.currentHp }),
        ...(dto.charStatus !== undefined && { charStatus: dto.charStatus }),
      },
    });
  }

  async removeSessionPlayerCharacter(
    id: string,
  ): Promise<SessionPlayerCharacter> {
    return await this.prisma.sessionPlayerCharacter.update({
      where: { id },
      data: { leftAt: new Date(), status: 'LEFT' },
    });
  }
}
