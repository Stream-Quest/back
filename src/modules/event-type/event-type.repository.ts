import { Injectable } from '@nestjs/common';
import { EventType } from '../../generated/prisma/client';
import {
  EventTypeFindManyArgs,
  EventTypeOrderByWithRelationInput,
  EventTypeUpdateInput,
  EventTypeWhereUniqueInput,
} from '../../generated/prisma/models';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../../helpers/pagination.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';

@Injectable()
export class EventTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getEventTypeList(options?: {
    take?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: EventTypeOrderByWithRelationInput;
  }): Promise<EventType[]> {
    return paginatedFindMany<EventType>(
      () =>
        this.prisma.eventType.findMany(
          buildPaginationArgs<EventTypeFindManyArgs>(options),
        ),
      options?.direction,
    );
  }

  async getEventType(
    where: EventTypeWhereUniqueInput,
  ): Promise<EventType | null> {
    return await this.prisma.eventType.findUnique({ where });
  }

  async createEventType(
    data: CreateEventTypeDto & { createdById: string },
  ): Promise<EventType> {
    const { createdById, ...rest } = data;

    return await this.prisma.eventType.create({
      data: {
        ...rest,
        createdBy: {
          connect: { id: createdById },
        },
      },
    });
  }

  async updateEventType(
    where: EventTypeWhereUniqueInput,
    data: EventTypeUpdateInput,
  ): Promise<EventType> {
    return await this.prisma.eventType.update({ where, data });
  }

  async deleteEventType(where: EventTypeWhereUniqueInput): Promise<EventType> {
    return await this.prisma.eventType.delete({ where });
  }
}
