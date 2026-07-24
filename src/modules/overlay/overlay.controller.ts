import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { OverlayService } from './overlay.service';
import { OverlayGuard } from './guard/overlay.guard';
import { OverlayPermission } from './decorator/overlay-permission.decorator';

@ApiTags('Overlay')
@Controller('overlay')
@Public()
export class OverlayController {
  constructor(private readonly overlayService: OverlayService) {}

  @Get(':sessionId/events')
  @OverlayPermission('canViewEvents')
  @UseGuards(OverlayGuard)
  async getEvents(@Param('sessionId') sessionId: string) {
    return this.overlayService.getEvents(sessionId);
  }

  @Get(':sessionId/karma')
  @OverlayPermission('canViewKarma')
  @UseGuards(OverlayGuard)
  async getKarma(@Param('sessionId') sessionId: string) {
    return this.overlayService.getKarma(sessionId);
  }

  @Get(':sessionId/context')
  @OverlayPermission('canViewContext')
  @UseGuards(OverlayGuard)
  async getContext(@Param('sessionId') sessionId: string) {
    return this.overlayService.getContext(sessionId);
  }

  @Get(':sessionId/players')
  @OverlayPermission('canViewPlayers')
  @UseGuards(OverlayGuard)
  async getPlayers(@Param('sessionId') sessionId: string) {
    return this.overlayService.getPlayers(sessionId);
  }

  @Get(':sessionId/milestones')
  @OverlayPermission('canViewMilestones')
  @UseGuards(OverlayGuard)
  async getMilestones(@Param('sessionId') sessionId: string) {
    return this.overlayService.getMilestones(sessionId);
  }
}
