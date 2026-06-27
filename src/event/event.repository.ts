import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  EventFindManyArgs,
  EventOrderByWithRelationInput,
  EventUpdateInput,
  EventWhereInput,
  EventWhereUniqueInput,
} from '../generated/prisma/models';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../helpers/pagination.helper';
import { Event, Prisma } from '../generated/prisma/client';
import { CreateEventDto } from './dto/create-event.dto';

export type EventWithCount = Prisma.EventGetPayload<{
  include: {
    _count: {
      select: {
        rules: true;
        resolutions: true;
      };
    };
  };
}>;

export type EventWithDetails = Prisma.EventGetPayload<{
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
}>;

const EVENT_INCLUDE_COUNT = {
  _count: {
    select: {
      rules: true,
      resolutions: true,
    },
  },
} satisfies Prisma.EventInclude;

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getEventList(
    where: EventWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: EventOrderByWithRelationInput;
    },
  ): Promise<EventWithCount[]> {
    return paginatedFindMany<EventWithCount>(
      () =>
        this.prisma.event.findMany({
          ...buildPaginationArgs<EventFindManyArgs>(options),
          where,
          include: EVENT_INCLUDE_COUNT,
        }),
      options?.direction,
    );
  }

  async getEvent(
    where: EventWhereUniqueInput,
  ): Promise<EventWithDetails | null> {
    return await this.prisma.event.findUnique({
      where,
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
    });
  }

  async createEvent(
    dto: CreateEventDto,
    gameMasterId: string,
  ): Promise<EventWithCount> {
    const { eventTypeId, ...data } = dto;

    return await this.prisma.event.create({
      data: {
        ...data,
        eventType: {
          connect: { id: eventTypeId },
        },
        gameMaster: {
          connect: { id: gameMasterId },
        },
      },
      include: EVENT_INCLUDE_COUNT,
    });
  }

  async updateEvent(
    where: EventWhereUniqueInput,
    data: EventUpdateInput,
  ): Promise<EventWithCount> {
    return await this.prisma.event.update({
      where,
      data,
      include: EVENT_INCLUDE_COUNT,
    });
  }

  async deleteEvent(where: EventWhereUniqueInput): Promise<Event> {
    return await this.prisma.event.delete({ where });
  }
}
