import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TwitchMappingRepository } from './twitch-mapping.repository';
import { TwitchMappingQueryDto } from './dto/twitch-mapping-query.dto';
import {
  DetailedTwitchMappingResponseDto,
  TwitchMappingResponseDto,
} from './dto/twitch-mapping-response.dto';
import { CreateTwitchMappingDto } from './dto/create-twitch-mapping.dto';
import { UpdateTwitchMappingDto } from './dto/update-twitch-mapping.dto';
import { EventRepository } from '../event/event.repository';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import { TwitchEventMapping } from '../../generated/prisma/client';
import { paginate } from '../../helpers/pagination.helper';

@Injectable()
export class TwitchMappingService {
  constructor(
    private readonly repository: TwitchMappingRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async getTwitchMappingList(
    campaignId: string,
    queryDto: TwitchMappingQueryDto,
  ): Promise<PaginationResponseDto<TwitchMappingResponseDto>> {
    const mappings = await this.repository.getTwitchMappingList(
      {
        campaignId,
        ...(queryDto.twitchEventType && {
          twitchEventType: queryDto.twitchEventType,
        }),
        ...(queryDto.isActive !== undefined && { isActive: queryDto.isActive }),
      },
      {
        take: (queryDto.limit || 10) + 1,
        cursor: queryDto.cursor,
        direction: queryDto.direction,
        orderBy: { createdAt: 'desc' },
      },
    );

    return paginate(mappings, queryDto);
  }

  async getTwitchMapping(
    id: string,
  ): Promise<DetailedTwitchMappingResponseDto> {
    if (!id) {
      throw new BadRequestException('Twitch mapping id is missing');
    }

    const mapping = await this.repository.getTwitchMapping({ id });

    if (!mapping) {
      throw new NotFoundException('Twitch mapping not found');
    }

    return mapping;
  }

  async createTwitchMapping(
    dto: CreateTwitchMappingDto,
    campaignId: string,
  ): Promise<TwitchMappingResponseDto> {
    const event = await this.eventRepository.getEvent({ id: dto.eventId });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return await this.repository.createTwitchMapping(dto, campaignId);
  }

  async updateTwitchMapping(
    dto: UpdateTwitchMappingDto,
    mapping: TwitchEventMapping,
  ): Promise<TwitchMappingResponseDto> {
    if (dto.eventId) {
      const event = await this.eventRepository.getEvent({ id: dto.eventId });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
    }

    return await this.repository.updateTwitchMapping({ id: mapping.id }, dto);
  }

  async deleteTwitchMapping(
    mapping: TwitchEventMapping,
  ): Promise<TwitchEventMapping> {
    return await this.repository.deleteTwitchMapping({ id: mapping.id });
  }
}
