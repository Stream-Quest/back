import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionEventQueryDto } from './dto/session-event-query.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import {
  DetailedSessionEventResponseDto,
  SessionEventResponseDto,
} from './dto/session-event-response.dto';
import { paginate } from '../../helpers/pagination.helper';
import { CreateSessionEventDto } from './dto/create-session-event.dto';
import { ValidateSessionEventDto } from './dto/validate-session-event.dto';
import { UpdateSessionEventDto } from './dto/update-session-event.dto';
import { SessionEvent } from '../../generated/prisma/client';
import { EventRepository } from '../event/event.repository';
import { RedisService } from '../../redis/redis.service';
import { SessionRepository } from '../session/session.repository';
import { KarmaEventService } from '../karma-event/karma-event.service';
import { SessionEventRepository } from './session-event.repository';

@Injectable()
export class SessionEventService {
  constructor(
    private readonly repository: SessionEventRepository,
    private readonly eventRepository: EventRepository,
    private readonly redisService: RedisService,
    private readonly karmaEventService: KarmaEventService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async getSessionEventList(
    sessionId: string,
    queryDto: SessionEventQueryDto,
  ): Promise<PaginationResponseDto<SessionEventResponseDto>> {
    const events = await this.repository.getSessionEventList(
      {
        sessionId,
        ...(queryDto.status && { status: queryDto.status }),
      },
      {
        take: (queryDto.limit || 10) + 1,
        cursor: queryDto.cursor,
        direction: queryDto.direction,
        orderBy: { triggeredAt: 'desc' },
      },
    );

    return paginate(events, queryDto);
  }

  async getSessionEvent(id: string): Promise<DetailedSessionEventResponseDto> {
    if (!id) {
      throw new BadRequestException('Session event id is missing');
    }

    const sessionEvent = await this.repository.getSessionEvent({ id });

    if (!sessionEvent) {
      throw new NotFoundException('Session event not found');
    }

    return sessionEvent;
  }

  async createSessionEvent(
    dto: CreateSessionEventDto,
    sessionId: string,
  ): Promise<SessionEventResponseDto> {
    const event = await this.eventRepository.getEvent({ id: dto.eventId });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const sessionEvent = await this.repository.createSessionEvent(
      dto,
      sessionId,
    );

    await this.redisService.publish(`session:${sessionId}:event:pending`, {
      sessionEventId: sessionEvent.id,
      eventId: sessionEvent.eventId,
      triggeredAt: sessionEvent.triggeredAt,
    });

    return sessionEvent;
  }

  async updateSessionEvent(
    dto: UpdateSessionEventDto,
    sessionEvent: SessionEvent,
  ): Promise<SessionEventResponseDto> {
    if (dto.eventId) {
      const event = await this.eventRepository.getEvent({ id: dto.eventId });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
    }

    return await this.repository.updateSessionEvent(
      { id: sessionEvent.id },
      dto,
    );
  }

  async validateSessionEvent(
    dto: ValidateSessionEventDto,
    sessionEvent: SessionEvent,
  ): Promise<SessionEventResponseDto> {
    const validated = await this.repository.validateSessionEvent(
      { id: sessionEvent.id },
      dto,
    );

    const event = await this.eventRepository.getEvent({
      id: validated.eventId,
    });

    if (event && event.karmaValue !== 0) {
      const session = await this.sessionRepository.getSession({
        id: sessionEvent.sessionId,
      });

      if (session) {
        await this.karmaEventService.applyKarma({
          campaignId: session.campaignId,
          value: event.karmaValue,
          reason: event.name,
          sessionId: sessionEvent.sessionId,
        });
      }
    }

    await this.redisService.publish(
      `session:${sessionEvent.sessionId}:event:validated`,
      {
        sessionEventId: validated.id,
        chosenResolutionId: validated.chosenResolutionId,
        finalMessage: validated.finalMessage,
      },
    );

    return validated;
  }

  async rejectSessionEvent(
    sessionEvent: SessionEvent,
  ): Promise<SessionEventResponseDto> {
    const rejected = await this.repository.rejectSessionEvent({
      id: sessionEvent.id,
    });

    await this.redisService.publish(
      `session:${sessionEvent.sessionId}:event:rejected`,
      {
        sessionEventId: rejected.id,
      },
    );

    return rejected;
  }

  async deleteSessionEvent(sessionEvent: SessionEvent): Promise<SessionEvent> {
    return await this.repository.deleteSessionEvent({ id: sessionEvent.id });
  }
}
