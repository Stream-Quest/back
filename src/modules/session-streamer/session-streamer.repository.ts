import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, SessionStreamer } from '../../generated/prisma/client';
import { UpdateSessionStreamerDto } from './dto/update-session-streamer.dto';

export type SessionStreamerWithUser = Prisma.SessionStreamerGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        avatarUrl: true;
        twitchId: true;
      };
    };
  };
}>;

type SessionWithCampaign = Prisma.SessionGetPayload<{
  include: {
    campaign: {
      select: {
        title: true;
        gameMaster: { select: { username: true } };
      };
    };
  };
}>;

@Injectable()
export class SessionStreamerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionStreamerList(
    sessionId: string,
  ): Promise<SessionStreamerWithUser[]> {
    return await this.prisma.sessionStreamer.findMany({
      where: { sessionId },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true, twitchId: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getSessionStreamer(id: string): Promise<SessionStreamer | null> {
    return await this.prisma.sessionStreamer.findUnique({ where: { id } });
  }

  async getSessionStreamerByUserAndSession(
    userId: string,
    sessionId: string,
  ): Promise<SessionStreamer | null> {
    return await this.prisma.sessionStreamer.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
  }

  async getSessionWithCampaign(
    sessionId: string,
  ): Promise<SessionWithCampaign | null> {
    return await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        campaign: {
          select: {
            title: true,
            gameMaster: { select: { username: true } },
          },
        },
      },
    });
  }

  async createSessionStreamer(
    sessionId: string,
    userId: string,
  ): Promise<SessionStreamer> {
    return await this.prisma.sessionStreamer.create({
      data: {
        session: { connect: { id: sessionId } },
        user: { connect: { id: userId } },
      },
    });
  }

  async updateSessionStreamer(
    id: string,
    dto: UpdateSessionStreamerDto,
  ): Promise<SessionStreamer> {
    return await this.prisma.sessionStreamer.update({
      where: { id },
      data: {
        ...(dto.canViewEvents !== undefined && {
          canViewEvents: dto.canViewEvents,
        }),
        ...(dto.canViewKarma !== undefined && {
          canViewKarma: dto.canViewKarma,
        }),
        ...(dto.canViewMilestones !== undefined && {
          canViewMilestones: dto.canViewMilestones,
        }),
        ...(dto.canViewContext !== undefined && {
          canViewContext: dto.canViewContext,
        }),
        ...(dto.canViewPlayers !== undefined && {
          canViewPlayers: dto.canViewPlayers,
        }),
        ...(dto.playerCharacterId !== undefined && {
          playerCharacter: dto.playerCharacterId
            ? { connect: { id: dto.playerCharacterId } }
            : { disconnect: true },
        }),
      },
    });
  }

  async deleteSessionStreamer(id: string): Promise<SessionStreamer> {
    return await this.prisma.sessionStreamer.delete({ where: { id } });
  }
}
