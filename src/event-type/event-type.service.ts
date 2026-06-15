import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventTypeRepository } from './event-type.repository';
import { EventTypeQueryDto } from './dto/event-type-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { EventTypeResponseDto } from './dto/event-type-response.dto';
import { paginate } from '../helpers/pagination.helper';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';
import { EventType } from '../generated/prisma/client';
import { JwtPayloadInterface } from '../auth/interface/auth.interface';

@Injectable()
export class EventTypeService {
  constructor(private readonly repository: EventTypeRepository) {}

  async getEventTypeList(
    queryDto: EventTypeQueryDto,
  ): Promise<PaginationResponseDto<EventTypeResponseDto>> {
    const eventType = await this.repository.getEventTypeList({
      take: (queryDto.limit || 10) + 1,
      cursor: queryDto.cursor,
      direction: queryDto.direction,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(eventType, queryDto);
  }

  async getEventType(id: string): Promise<EventTypeResponseDto> {
    if (!id) {
      throw new BadRequestException('EventType id is missing');
    }

    const eventType = await this.repository.getEventType({ id });

    if (!eventType) {
      throw new NotFoundException('EventType not found');
    }

    return eventType;
  }

  async createEventType(
    dto: CreateEventTypeDto,
    user: JwtPayloadInterface,
  ): Promise<EventTypeResponseDto> {
    return await this.repository.createEventType({
      ...dto,
      createdById: user.sub,
    });
  }

  async updateEventType(
    dto: UpdateEventTypeDto,
    eventType: EventType,
  ): Promise<EventTypeResponseDto> {
    return await this.repository.updateEventType({ id: eventType.id }, dto);
  }

  async deleteEventType(eventType: EventType): Promise<EventType> {
    return await this.repository.deleteEventType({
      id: eventType.id,
    });
  }
}
