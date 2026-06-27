import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContextSnapshotWhereInput,
  SessionFindManyArgs,
  SessionOrderByWithRelationInput,
  SessionUpdateInput,
  SessionWhereInput,
  SessionWhereUniqueInput,
} from '../generated/prisma/models';
import {
  ContextSnapshot,
  Prisma,
  Session,
  SessionStatus,
} from '../generated/prisma/client';
import { UpdateContextSnapshotDto } from './dto/update-context.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../helpers/pagination.helper';

export type SessionWithCount = Prisma.SessionGetPayload<{
  include: {
    _count: {
      select: {
        contextSnapshots: true;
        karmaEvents: true;
        sessionEvents: true;
        sessionPlayers: true;
        viewerInteractions: true;
      };
    };
  };
}>;

const SESSION_INCLUDE_COUNT = {
  _count: {
    select: {
      contextSnapshots: true,
      karmaEvents: true,
      sessionEvents: true,
      sessionPlayers: true,
      viewerInteractions: true,
    },
  },
} satisfies Prisma.SessionInclude;

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionList(
    where: SessionWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: SessionOrderByWithRelationInput;
    },
  ): Promise<SessionWithCount[]> {
    return paginatedFindMany<SessionWithCount>(
      () =>
        this.prisma.session.findMany({
          ...buildPaginationArgs<SessionFindManyArgs>(options),
          where,
          include: SESSION_INCLUDE_COUNT,
        }),
      options?.direction,
    );
  }

  async getSession(
    where: SessionWhereUniqueInput,
  ): Promise<SessionWithCount | null> {
    return await this.prisma.session.findUnique({
      where,
      include: SESSION_INCLUDE_COUNT,
    });
  }

  async createSession(dto: CreateSessionDto): Promise<SessionWithCount> {
    const { campaignId, ...data } = dto;

    return await this.prisma.session.create({
      data: {
        ...data,
        campaign: {
          connect: { id: campaignId },
        },
      },
      include: SESSION_INCLUDE_COUNT,
    });
  }

  async updateSession(
    where: SessionWhereUniqueInput,
    data: SessionUpdateInput,
  ): Promise<SessionWithCount> {
    return await this.update(where, data);
  }

  async updateSessionStatus(
    where: SessionWhereUniqueInput,
    data: SessionUpdateInput,
  ): Promise<SessionWithCount> {
    return await this.update(where, data);
  }

  async startSession(
    where: SessionWhereUniqueInput,
  ): Promise<SessionWithCount> {
    return await this.update(where, {
      status: SessionStatus.LIVE,
      startedAt: new Date(),
    });
  }

  async endSession(where: SessionWhereUniqueInput): Promise<SessionWithCount> {
    return await this.update(where, {
      status: SessionStatus.ENDED,
      endedAt: new Date(),
    });
  }

  async getContextSnapshots(
    where: ContextSnapshotWhereInput,
  ): Promise<ContextSnapshot[]> {
    return await this.prisma.contextSnapshot.findMany({
      where,
      orderBy: { snapshotAt: 'desc' },
    });
  }

  async createContextSnapshot(
    data: UpdateContextSnapshotDto,
    sessionId: string,
  ): Promise<void> {
    await this.prisma.contextSnapshot.create({
      data: {
        session: {
          connect: {
            id: sessionId,
          },
        },
        ...(data.weatherId && {
          weather: { connect: { id: data.weatherId } },
        }),
        ...(data.locationId && {
          location: { connect: { id: data.locationId } },
        }),
        timeOfDay: data.timeOfDay,
        snapshotAt: new Date(),
      },
    });
  }

  async deleteSession(where: SessionWhereUniqueInput): Promise<Session> {
    return await this.prisma.session.delete({ where });
  }

  private async update(
    where: SessionWhereUniqueInput,
    data: SessionUpdateInput,
  ): Promise<SessionWithCount> {
    return await this.prisma.session.update({
      where,
      data,
      include: SESSION_INCLUDE_COUNT,
    });
  }
}
