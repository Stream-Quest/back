import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionStreamerService } from './session-streamer.service';
import {
  DetailedSessionStreamerResponseDto,
  InviteLinkResponseDto,
  SessionStreamerResponseDto,
} from './dto/session-streamer-response.dto';
import {
  DeleteSessionStreamerRoute,
  GenerateInviteLinkRoute,
  GetOverlayLinkRoute,
  GetSessionStreamerListRoute,
  UpdateSessionStreamerRoute,
} from './decorator/session-streamer-routes.decorator';
import { SessionStreamerContext } from './decorator/session-streamer.decorator';
import { UpdateSessionStreamerDto } from './dto/update-session-streamer.dto';
import type { Session, SessionStreamer } from '../../generated/prisma/client';
import { SessionContext } from '../session/decorator/session.decorator';
import { UserContext } from '../../decorators/user.decorator';
import type { JwtPayloadInterface } from '../../auth/interface/auth.interface';
import { OverlayLinkResponseDto } from './dto/overlay-link-response.dto';

@ApiTags('Session Streamer')
@Controller('session')
export class SessionStreamerController {
  constructor(
    private readonly sessionStreamerService: SessionStreamerService,
  ) {}

  @Get(':id/streamer')
  @GetSessionStreamerListRoute('Get session streamer list')
  async getSessionStreamerList(
    @SessionContext() session: Session,
  ): Promise<DetailedSessionStreamerResponseDto[]> {
    return await this.sessionStreamerService.getSessionStreamerList(session.id);
  }

  @Post(':id/streamer/invite')
  @GenerateInviteLinkRoute('Generate invite link for this session')
  generateInviteLink(
    @SessionContext() session: Session,
  ): InviteLinkResponseDto {
    return this.sessionStreamerService.generateInviteLink(session);
  }

  @Patch(':id/streamer/:streamerId')
  @UpdateSessionStreamerRoute('Update streamer overlay permissions')
  async updateSessionStreamer(
    @Body() updateDto: UpdateSessionStreamerDto,
    @SessionStreamerContext() streamer: SessionStreamer,
  ): Promise<SessionStreamerResponseDto> {
    return await this.sessionStreamerService.updateSessionStreamer(
      updateDto,
      streamer,
    );
  }

  @Delete(':id/streamer/:streamerId')
  @DeleteSessionStreamerRoute('Remove a streamer from the session')
  async deleteSessionStreamer(
    @SessionStreamerContext() streamer: SessionStreamer,
  ): Promise<SessionStreamer> {
    return await this.sessionStreamerService.deleteSessionStreamer(streamer);
  }

  @Get(':id/me/overlay-link')
  @GetOverlayLinkRoute('Get your own overlay links for this session')
  async getMyOverlayLink(
    @Param('id') sessionId: string,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<OverlayLinkResponseDto> {
    return await this.sessionStreamerService.getOverlayLink(
      sessionId,
      user.sub,
    );
  }
}
