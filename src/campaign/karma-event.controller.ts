import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KarmaEventService } from './karma-event.service';
import { ThresholdEventService } from './threshold-event.service';
import { KarmaEventQueryDto } from './dto/karma/karma-event-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { ThresholdEventQueryDto } from './dto/threshold/threshold-event-query.dto';
import { CreateThresholdEventDto } from './dto/threshold/create-threshold-event.dto';
import { UpdateThresholdEventDto } from './dto/threshold/update-threshold-event.dto';
import {
  DetailedThresholdEventResponseDto,
  ThresholdEventResponseDto,
} from './dto/threshold/threshold-event-response.dto';
import {
  GetKarmaEventDetailsRoute,
  GetKarmaEventListRoute,
  GetThresholdEventDetailsRoute,
  GetThresholdEventListRoute,
  CreateThresholdEventRoute,
  UpdateThresholdEventRoute,
  DeleteThresholdEventRoute,
} from './decorator/karma-event-routes.decorator';
import { ThresholdEventContext } from './decorator/threshold-event.decorator';
import type { CampaignThresholdEvent } from '../generated/prisma/client';
import { KarmaEventResponseDto } from './dto/karma/karma-event-response.dto';

@ApiTags('Karma')
@Controller('campaign')
export class KarmaEventController {
  constructor(
    private readonly karmaService: KarmaEventService,
    private readonly thresholdEventService: ThresholdEventService,
  ) {}

  @Get(':id/karma-event')
  @GetKarmaEventListRoute('Get karma event list')
  async getKarmaEventList(
    @Param('id') campaignId: string,
    @Query() queryDto: KarmaEventQueryDto,
  ): Promise<PaginationResponseDto<KarmaEventResponseDto>> {
    return await this.karmaService.getKarmaEventList(campaignId, queryDto);
  }

  @Get(':id/karma-event/:karmaEventId')
  @GetKarmaEventDetailsRoute('Get karma event details')
  async getKarmaEvent(
    @Param('karmaEventId') karmaEventId: string,
  ): Promise<KarmaEventResponseDto> {
    return await this.karmaService.getKarmaEvent(karmaEventId);
  }

  @Get(':id/threshold-event')
  @GetThresholdEventListRoute('Get threshold event list')
  async getThresholdEventList(
    @Param('id') campaignId: string,
    @Query() queryDto: ThresholdEventQueryDto,
  ): Promise<PaginationResponseDto<ThresholdEventResponseDto>> {
    return await this.thresholdEventService.getThresholdEventList(
      campaignId,
      queryDto,
    );
  }

  @Get(':id/threshold-event/:thresholdEventId')
  @GetThresholdEventDetailsRoute('Get threshold event details')
  async getThresholdEvent(
    @Param('thresholdEventId') thresholdEventId: string,
  ): Promise<DetailedThresholdEventResponseDto> {
    return await this.thresholdEventService.getThresholdEvent(thresholdEventId);
  }

  @Post(':id/threshold-event')
  @CreateThresholdEventRoute('Create a threshold event')
  async createThresholdEvent(
    @Param('id') campaignId: string,
    @Body() createDto: CreateThresholdEventDto,
  ): Promise<ThresholdEventResponseDto> {
    return await this.thresholdEventService.createThresholdEvent(
      createDto,
      campaignId,
    );
  }

  @Patch(':id/threshold-event/:thresholdEventId')
  @UpdateThresholdEventRoute('Update a threshold event')
  async updateThresholdEvent(
    @Body() updateDto: UpdateThresholdEventDto,
    @ThresholdEventContext() thresholdEvent: CampaignThresholdEvent,
  ): Promise<ThresholdEventResponseDto> {
    return await this.thresholdEventService.updateThresholdEvent(
      updateDto,
      thresholdEvent,
    );
  }

  @Delete(':id/threshold-event/:thresholdEventId')
  @DeleteThresholdEventRoute('Delete a threshold event')
  async deleteThresholdEvent(
    @ThresholdEventContext() thresholdEvent: CampaignThresholdEvent,
  ): Promise<CampaignThresholdEvent> {
    return await this.thresholdEventService.deleteThresholdEvent(
      thresholdEvent,
    );
  }
}
