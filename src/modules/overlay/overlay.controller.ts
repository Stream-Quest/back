import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { OverlayService } from './overlay.service';
import { OverlayEventResponseDto } from './dto/overlay-event-response.dto';
import { OverlayKarmaResponseDto } from './dto/overlay-karma-response.dto';
import { OverlayContextResponseDto } from './dto/overlay-context-response.dto';
import { OverlayPlayerResponseDto } from './dto/overlay-player-response.dto';
import { OverlayMilestoneResponseDto } from './dto/overlay-milestone-response.dto';
import {
  GetOverlayContextRoute,
  GetOverlayEventsRoute,
  GetOverlayKarmaRoute,
  GetOverlayMilestonesRoute,
  GetOverlayPlayersRoute,
} from './decorator/overlay-routes.decorator';

@ApiTags('Overlay')
@Controller('overlay')
@Public()
export class OverlayController {
  constructor(private readonly overlayService: OverlayService) {}

  @Get(':sessionId/events')
  @GetOverlayEventsRoute('Get recent session events')
  async getEvents(
    @Param('sessionId') sessionId: string,
  ): Promise<OverlayEventResponseDto[]> {
    return this.overlayService.getEvents(sessionId);
  }

  @Get(':sessionId/karma')
  @GetOverlayKarmaRoute("Get the session's campaign karma")
  async getKarma(
    @Param('sessionId') sessionId: string,
  ): Promise<OverlayKarmaResponseDto | null> {
    return this.overlayService.getKarma(sessionId);
  }

  @Get(':sessionId/context')
  @GetOverlayContextRoute('Get the latest context snapshot')
  async getContext(
    @Param('sessionId') sessionId: string,
  ): Promise<OverlayContextResponseDto | null> {
    return this.overlayService.getContext(sessionId);
  }

  @Get(':sessionId/players')
  @GetOverlayPlayersRoute('Get active player characters')
  async getPlayers(
    @Param('sessionId') sessionId: string,
  ): Promise<OverlayPlayerResponseDto[]> {
    return this.overlayService.getPlayers(sessionId);
  }

  @Get(':sessionId/milestones')
  @GetOverlayMilestonesRoute('Get active campaign milestones')
  async getMilestones(
    @Param('sessionId') sessionId: string,
  ): Promise<OverlayMilestoneResponseDto[]> {
    return this.overlayService.getMilestones(sessionId);
  }
}
