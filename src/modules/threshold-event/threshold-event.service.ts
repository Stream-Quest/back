import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ThresholdEventRepository } from './threshold-event.repository';
import { ThresholdEventQueryDto } from './dto/threshold-event-query.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import {
  DetailedThresholdEventResponseDto,
  ThresholdEventResponseDto,
} from './dto/threshold-event-response.dto';
import { paginate } from '../../helpers/pagination.helper';
import { CreateThresholdEventDto } from './dto/create-threshold-event.dto';
import { UpdateThresholdEventDto } from './dto/update-threshold-event.dto';
import { CampaignThresholdEvent } from '../../generated/prisma/client';
import { EventRepository } from '../event/event.repository';

@Injectable()
export class ThresholdEventService {
  constructor(
    private readonly repository: ThresholdEventRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async getThresholdEventList(
    campaignId: string,
    queryDto: ThresholdEventQueryDto,
  ): Promise<PaginationResponseDto<ThresholdEventResponseDto>> {
    const events = await this.repository.getThresholdEventList(
      {
        campaignId,
        ...(queryDto.thresholdType && {
          thresholdType: queryDto.thresholdType,
        }),
      },
      {
        take: (queryDto.limit || 10) + 1,
        cursor: queryDto.cursor,
        direction: queryDto.direction,
        orderBy: { createdAt: 'desc' },
      },
    );

    return paginate(events, queryDto);
  }

  async getThresholdEvent(
    id: string,
  ): Promise<DetailedThresholdEventResponseDto> {
    if (!id) {
      throw new BadRequestException('Threshold event id is missing');
    }

    const thresholdEvent = await this.repository.getThresholdEvent({ id });

    if (!thresholdEvent) {
      throw new NotFoundException('Threshold event not found');
    }

    return thresholdEvent;
  }

  async createThresholdEvent(
    dto: CreateThresholdEventDto,
    campaignId: string,
  ): Promise<ThresholdEventResponseDto> {
    const event = await this.eventRepository.getEvent({ id: dto.eventId });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return await this.repository.createThresholdEvent(dto, campaignId);
  }

  async updateThresholdEvent(
    dto: UpdateThresholdEventDto,
    thresholdEvent: CampaignThresholdEvent,
  ): Promise<ThresholdEventResponseDto> {
    if (dto.eventId) {
      const event = await this.eventRepository.getEvent({ id: dto.eventId });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
    }

    return await this.repository.updateThresholdEvent(
      { id: thresholdEvent.id },
      dto,
    );
  }

  async deleteThresholdEvent(
    thresholdEvent: CampaignThresholdEvent,
  ): Promise<CampaignThresholdEvent> {
    return await this.repository.deleteThresholdEvent({
      id: thresholdEvent.id,
    });
  }
}
