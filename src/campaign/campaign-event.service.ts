import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CampaignEventRepository } from './campaign-event.repository';
import { CampaignEventQueryDto } from './dto/event/campaign-event-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import {
  CampaignEventResponseDto,
  DetailedCampaignEventResponseDto,
} from './dto/event/campaign-event-response.dto';
import { paginate } from '../helpers/pagination.helper';
import { CreateCampaignEventDto } from './dto/event/create-campaign-event.dto';
import { EventRepository } from '../event/event.repository';
import { UpdateCampaignEventDto } from './dto/event/update-campaign-event.dto';
import { CampaignEvent } from '../generated/prisma/client';

@Injectable()
export class CampaignEventService {
  constructor(
    private readonly repository: CampaignEventRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async getCampaignEventList(
    campaignId: string,
    queryDto: CampaignEventQueryDto,
  ): Promise<PaginationResponseDto<CampaignEventResponseDto>> {
    const events = await this.repository.getCampaignEventList(
      { campaignId },
      {
        take: (queryDto.limit || 10) + 1,
        cursor: queryDto.cursor,
        direction: queryDto.direction,
        orderBy: { createdAt: 'desc' },
      },
    );

    return paginate(events, queryDto);
  }

  async getCampaignEvent(
    id: string,
  ): Promise<DetailedCampaignEventResponseDto> {
    if (!id) {
      throw new BadRequestException('Campaign event id is missing');
    }

    const campaignEvent = await this.repository.getCampaignEvent({ id });

    if (!campaignEvent) {
      throw new NotFoundException('Campaign event not found');
    }

    return campaignEvent;
  }

  async createCampaignEvent(
    dto: CreateCampaignEventDto,
    campaignId: string,
  ): Promise<CampaignEventResponseDto> {
    const event = await this.eventRepository.getEvent({ id: dto.eventId });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return await this.repository.createCampaignEvent(dto, campaignId);
  }

  async updateCampaignEvent(
    dto: UpdateCampaignEventDto,
    campaignEvent: CampaignEvent,
  ): Promise<CampaignEventResponseDto> {
    return await this.repository.updateCampaignEvent(
      { id: campaignEvent.id },
      dto,
    );
  }

  async deleteCampaignEvent(
    campaignEvent: CampaignEvent,
  ): Promise<CampaignEvent> {
    return await this.repository.deleteCampaignEvent({ id: campaignEvent.id });
  }
}
