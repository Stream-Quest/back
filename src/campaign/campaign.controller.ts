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
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { UpdateCampaignStatusDto } from './dto/update-status.dto';
import { UpdateKarmaDto } from './dto/update-karma.dto';
import { CampaignService } from './campaign.service';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { CampaignQueryDto } from './dto/campaign-query.dto';
import {
  CreateCampaignEventRoute,
  CreateCampaignRoute,
  DeleteCampaignEventRoute,
  DeleteCampaignFromTrashRoute,
  GetCampaignDetailsRoute,
  GetCampaignEventDetailsRoute,
  GetCampaignEventListRoute,
  GetCampaignListRoute,
  RestoreSoftRemovedCampaignRoute,
  SoftRemoveCampaignRoute,
  UpdateCampaignEventRoute,
  UpdateCampaignKarmaRoute,
  UpdateCampaignRoute,
  UpdateCampaignStatusRoute,
} from './decorator/campaign-routes.decorator';
import type { JwtPayloadInterface } from '../auth/interface/auth.interface';
import { UserContext } from '../decorators/user.decorator';
import { CampaignContext } from './decorator/campaign.decorator';
import type { Campaign, CampaignEvent } from '../generated/prisma/client';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { CampaignEventQueryDto } from './dto/event/campaign-event-query.dto';
import { CreateCampaignEventDto } from './dto/event/create-campaign-event.dto';
import { UpdateCampaignEventDto } from './dto/event/update-campaign-event.dto';
import {
  CampaignEventResponseDto,
  DetailedCampaignEventResponseDto,
} from './dto/event/campaign-event-response.dto';
import { CampaignEventService } from './campaign-event.service';
import { CampaignEventContext } from './decorator/campaign-event.decorator';
import { UpdateKarmaResponseDto } from './dto/update-karma-response.dto';

@ApiTags('Campaign')
@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly campaignEventService: CampaignEventService,
  ) {}

  @Get('')
  @GetCampaignListRoute("Get user's campaigns")
  async campaignList(
    @Query() filterDto: CampaignQueryDto,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<PaginationResponseDto<CampaignResponseDto>> {
    return this.campaignService.getCampaignList(user, filterDto);
  }

  @Get(':id')
  @GetCampaignDetailsRoute("Get a campaign's details")
  async campaignDetails(
    @Param('id') campaignId: string,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.getCampaign(campaignId, user);
  }

  @Post('')
  @CreateCampaignRoute('Create a campaign')
  async createCampaign(
    @Body() createDto: CreateCampaignDto,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.createCampaign(createDto, user);
  }

  @Patch(':id')
  @UpdateCampaignRoute('Update a campaign')
  async updateCampaign(
    @Body() updateDto: UpdateCampaignDto,
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaign(updateDto, campaign);
  }

  @Patch(':id/status')
  @UpdateCampaignStatusRoute('Update the status of a campaign')
  async updateCampaignStatus(
    @Body() updateDto: UpdateCampaignStatusDto,
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaignStatus(updateDto, campaign);
  }

  @Patch(':id/karma')
  @UpdateCampaignKarmaRoute('Update the karma of a campaign')
  async updateCampaignKarma(
    @Body() updateDto: UpdateKarmaDto,
    @CampaignContext() campaign: Campaign,
  ): Promise<UpdateKarmaResponseDto> {
    return this.campaignService.updateCampaignKarma(updateDto, campaign);
  }

  @Delete(':id')
  @SoftRemoveCampaignRoute('Temporary remove a campaign')
  async softRemoveCampaign(
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.softRemoveCampaign(campaign);
  }

  @Patch(':id/restore')
  @RestoreSoftRemovedCampaignRoute('Restore a removed campaign')
  async restoreSoftRemovedCampaign(
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.restoreSoftRemovedCampaign(campaign);
  }

  @Delete(':id/permanent')
  @DeleteCampaignFromTrashRoute('Permanently delete a campaign')
  async deleteCampaignFromTrash(
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.deleteCampaign(campaign);
  }

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
