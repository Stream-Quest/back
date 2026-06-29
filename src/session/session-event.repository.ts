import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SessionEventFindManyArgs,
  SessionEventOrderByWithRelationInput,
  SessionEventWhereInput,
  SessionEventWhereUniqueInput,
} from '../generated/prisma/models';
import {
  Prisma,
  SessionEvent,
  SessionEventStatus,
} from '../generated/prisma/client';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../helpers/pagination.helper';
import { CreateSessionEventDto } from './dto/event/create-session-event.dto';
import { ValidateSessionEventDto } from './dto/event/validate-session-event.dto';
import { UpdateSessionEventDto } from './dto/event/update-session-event.dto';

export type SessionEventWithDetails = Prisma.SessionEventGetPayload<{
  include: {
    event: {
      include: {
        rules: true;
        resolutions: {
          include: {
            conditionGroups: {
              include: {
                conditions: true;
              };
            };
          };
        };
      };
    };
    chosenResolution: {
      include: {
        conditionGroups: {
          include: {
            conditions: true;
          };
        };
      };
    };
    sessionEventResolutions: true;
  };
}>;

const SESSION_EVENT_INCLUDE_DETAILS = {
  event: {
    include: {
      rules: true,
      resolutions: {
        include: {
          conditionGroups: {
            include: {
              conditions: true,
            },
          },
        },
      },
    },
  },
  chosenResolution: {
    include: {
      conditionGroups: {
        include: {
          conditions: true,
        },
      },
    },
  },
  sessionEventResolutions: true,
} satisfies Prisma.SessionEventInclude;

@Injectable()
export class SessionEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionEventList(
    where: SessionEventWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: SessionEventOrderByWithRelationInput;
    },
  ): Promise<SessionEvent[]> {
    return await paginatedFindMany<SessionEvent>(
      () =>
        this.prisma.sessionEvent.findMany({
          ...buildPaginationArgs<SessionEventFindManyArgs>(options),
          where,
        }),
      options?.direction,
    );
  }

  async getSessionEvent(
    where: SessionEventWhereUniqueInput,
  ): Promise<SessionEventWithDetails | null> {
    return await this.prisma.sessionEvent.findUnique({
      where,
      include: SESSION_EVENT_INCLUDE_DETAILS,
    });
  }

  async createSessionEvent(
    dto: CreateSessionEventDto,
    sessionId: string,
  ): Promise<SessionEvent> {
    return await this.prisma.sessionEvent.create({
      data: {
        session: { connect: { id: sessionId } },
        event: { connect: { id: dto.eventId } },
        triggeredAt: dto.triggeredAt ? new Date(dto.triggeredAt) : new Date(),
      },
    });
  }

  async updateSessionEvent(
    where: SessionEventWhereUniqueInput,
    dto: UpdateSessionEventDto,
  ): Promise<SessionEvent> {
    return await this.prisma.sessionEvent.update({
      where,
      data: {
        ...(dto.finalMessage !== undefined && {
          finalMessage: dto.finalMessage,
        }),
        ...(dto.eventId && { event: { connect: { id: dto.eventId } } }),
      },
    });
  }

  async validateSessionEvent(
    where: SessionEventWhereUniqueInput,
    dto: ValidateSessionEventDto,
  ): Promise<SessionEvent> {
    return await this.prisma.sessionEvent.update({
      where,
      data: {
        status: SessionEventStatus.VALIDATED,
        resolvedAt: new Date(),
        chosenResolution: { connect: { id: dto.chosenResolutionId } },
        ...(dto.finalMessage && { finalMessage: dto.finalMessage }),
      },
    });
  }

  async rejectSessionEvent(
    where: SessionEventWhereUniqueInput,
  ): Promise<SessionEvent> {
    return await this.prisma.sessionEvent.update({
      where,
      data: {
        status: SessionEventStatus.REJECTED,
        resolvedAt: new Date(),
      },
    });
  }

  async deleteSessionEvent(
    where: SessionEventWhereUniqueInput,
  ): Promise<SessionEvent> {
    return await this.prisma.sessionEvent.delete({ where });
  }
}
