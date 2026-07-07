import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventRepository } from './event.repository';
import { EventQueryDto } from './dto/event-query.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import {
  DetailedEventResponseDto,
  EventResponseDto,
} from './dto/event-response.dto';
import { EventWhereInput } from '../../generated/prisma/models';
import { JwtPayloadInterface } from '../../auth/interface/auth.interface';
import { paginate } from '../../helpers/pagination.helper';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from '../../generated/prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { EventTypeRepository } from '../event-type/event-type.repository';

@Injectable()
export class EventService {
  constructor(
    private readonly repository: EventRepository,
    private readonly eventTypeRepository: EventTypeRepository,
  ) {}

  async getEventList(
    queryDto: EventQueryDto,
    user: JwtPayloadInterface,
  ): Promise<PaginationResponseDto<EventResponseDto>> {
    const whereClause: EventWhereInput = {
      gameMasterId: user.sub,
    };

    if (queryDto.isTemplate != null) {
      whereClause.isTemplate = queryDto.isTemplate;
    }

    if (queryDto.isPublic != null) {
      whereClause.isPublic = queryDto.isPublic;
    }

    if (queryDto.eventTypeId) {
      whereClause.eventTypeId = queryDto.eventTypeId;
    }

    const events = await this.repository.getEventList(whereClause, {
      take: (queryDto.limit || 10) + 1,
      cursor: queryDto.cursor,
      direction: queryDto.direction,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(events, queryDto);
  }

  async getEvent(id: string): Promise<DetailedEventResponseDto> {
    if (!id) {
      throw new BadRequestException('Event id is missing');
    }

    const event = await this.repository.getEvent({ id });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async createEvent(
    dto: CreateEventDto,
    user: JwtPayloadInterface,
  ): Promise<EventResponseDto> {
    const eventType = await this.eventTypeRepository.getEventType({
      id: dto.eventTypeId,
    });

    if (!eventType) {
      throw new NotFoundException('EventType not found');
    }

    return await this.repository.createEvent(dto, user.sub);
  }

  async updateEvent(
    dto: UpdateEventDto,
    event: Event,
  ): Promise<EventResponseDto> {
    return await this.repository.updateEvent({ id: event.id }, dto);
  }

  async deleteEvent(event: Event): Promise<Event> {
    return await this.repository.deleteEvent({ id: event.id });
  }
}
