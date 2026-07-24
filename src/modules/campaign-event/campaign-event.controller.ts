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
import {
  CreateCampaignEventRoute,
  GetCampaignEventListRoute,
  GetCampaignEventDetailsRoute,
  UpdateCampaignEventRoute,
  DeleteCampaignEventRoute,
} from './decorator/campaign-event-routes.decorator';
import { CampaignEventQueryDto } from './dto/campaign-event-query.dto';
import { CreateCampaignEventDto } from './dto/create-campaign-event.dto';
import { UpdateCampaignEventDto } from './dto/update-campaign-event.dto';
import {
  CampaignEventResponseDto,
  DetailedCampaignEventResponseDto,
} from './dto/campaign-event-response.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import { CampaignEventService } from './campaign-event.service';
import { CampaignEventContext } from './decorator/campaign-event.decorator';
import type { CampaignEvent } from '../../generated/prisma/client';

@ApiTags('Campaign Event')
@Controller('campaign')
export class CampaignEventController {
  constructor(private readonly campaignEventService: CampaignEventService) {}

  @Get(':id/event')
  @GetCampaignEventListRoute("Get a list of Campaign's events")
  async getCampaignEventList(
    @Param('id') campaignId: string,
    @Query() queryDto: CampaignEventQueryDto,
  ): Promise<PaginationResponseDto<CampaignEventResponseDto>> {
    return await this.campaignEventService.getCampaignEventList(
      campaignId,
      queryDto,
    );
  }

  @Get(':id/event/:campaignEventId')
  @GetCampaignEventDetailsRoute("Get the details of a Campaign's event")
  async getCampaignEvent(
    @Param('campaignEventId') campaignEventId: string,
  ): Promise<DetailedCampaignEventResponseDto> {
    return await this.campaignEventService.getCampaignEvent(campaignEventId);
  }

  @Post(':id/event')
  @CreateCampaignEventRoute('Create a Campaign event')
  async createCampaignEvent(
    @Param('id') campaignId: string,
    @Body() createDto: CreateCampaignEventDto,
  ): Promise<CampaignEventResponseDto> {
    return await this.campaignEventService.createCampaignEvent(
      createDto,
      campaignId,
    );
  }

  @Patch(':id/event/:campaignEventId')
  @UpdateCampaignEventRoute("Update a Campaign's event")
  async updateCampaignEvent(
    @Body() updateDto: UpdateCampaignEventDto,
    @CampaignEventContext() campaignEvent: CampaignEvent,
  ) {
    return await this.campaignEventService.updateCampaignEvent(
      updateDto,
      campaignEvent,
    );
  }

  @Delete(':id/event/:campaignEventId')
  @DeleteCampaignEventRoute("Delete a Campaign's event")
  async deleteCampaignEvent(
    @CampaignEventContext() campaignEvent: CampaignEvent,
  ): Promise<CampaignEvent> {
    return await this.campaignEventService.deleteCampaignEvent(campaignEvent);
  }
}
