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
import { TwitchMappingService } from './twitch-mapping.service';
import { TwitchMappingQueryDto } from './dto/twitch-mapping-query.dto';
import { CreateTwitchMappingDto } from './dto/create-twitch-mapping.dto';
import { UpdateTwitchMappingDto } from './dto/update-twitch-mapping.dto';
import {
  DetailedTwitchMappingResponseDto,
  TwitchMappingResponseDto,
} from './dto/twitch-mapping-response.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import {
  GetTwitchMappingListRoute,
  GetTwitchMappingDetailsRoute,
  CreateTwitchMappingRoute,
  UpdateTwitchMappingRoute,
  DeleteTwitchMappingRoute,
  ResetTwitchMappingCountRoute,
} from './decorator/twitch-mapping-routes.decorator';
import { TwitchMappingContext } from './decorator/twitch-mapping.decorator';
import type { TwitchEventMapping } from '../../generated/prisma/client';

@ApiTags('Twitch Mapping')
@Controller('campaign')
export class TwitchMappingController {
  constructor(private readonly service: TwitchMappingService) {}

  @Get(':id/twitch-mapping')
  @GetTwitchMappingListRoute('Get twitch mapping list')
  async getTwitchMappingList(
    @Param('id') campaignId: string,
    @Query() queryDto: TwitchMappingQueryDto,
  ): Promise<PaginationResponseDto<TwitchMappingResponseDto>> {
    return await this.service.getTwitchMappingList(campaignId, queryDto);
  }

  @Get(':id/twitch-mapping/:mappingId')
  @GetTwitchMappingDetailsRoute('Get twitch mapping details')
  async getTwitchMapping(
    @Param('mappingId') mappingId: string,
  ): Promise<DetailedTwitchMappingResponseDto> {
    return await this.service.getTwitchMapping(mappingId);
  }

  @Post(':id/twitch-mapping')
  @CreateTwitchMappingRoute('Create a twitch mapping')
  async createTwitchMapping(
    @Param('id') campaignId: string,
    @Body() createDto: CreateTwitchMappingDto,
  ): Promise<TwitchMappingResponseDto> {
    return await this.service.createTwitchMapping(createDto, campaignId);
  }

  @Patch(':id/twitch-mapping/:mappingId')
  @UpdateTwitchMappingRoute('Update a twitch mapping')
  async updateTwitchMapping(
    @Body() updateDto: UpdateTwitchMappingDto,
    @TwitchMappingContext() mapping: TwitchEventMapping,
  ): Promise<TwitchMappingResponseDto> {
    return await this.service.updateTwitchMapping(updateDto, mapping);
  }

  @Delete(':id/twitch-mapping/:mappingId')
  @DeleteTwitchMappingRoute('Delete a twitch mapping')
  async deleteTwitchMapping(
    @TwitchMappingContext() mapping: TwitchEventMapping,
  ): Promise<TwitchEventMapping> {
    return await this.service.deleteTwitchMapping(mapping);
  }

  @Post(':id/twitch-mapping/:mappingId/reset-count')
  @ResetTwitchMappingCountRoute('Reset the event counter of a twitch mapping')
  async resetMappingCount(
    @TwitchMappingContext() mapping: TwitchEventMapping,
  ): Promise<TwitchMappingResponseDto> {
    return await this.service.resetMappingCount(mapping);
  }
}
