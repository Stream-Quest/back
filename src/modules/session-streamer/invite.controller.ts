import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionStreamerService } from './session-streamer.service';
import {
  InviteInfoResponseDto,
  SessionStreamerResponseDto,
} from './dto/session-streamer-response.dto';
import {
  GetInviteInfoRoute,
  JoinAsStreamerRoute,
} from './decorator/session-streamer-routes.decorator';
import { Public } from '../../decorators/public.decorator';
import { UserContext } from '../../decorators/user.decorator';
import type { JwtPayloadInterface } from '../../auth/interface/auth.interface';

@ApiTags('Invite')
@Controller('invite')
export class InviteController {
  constructor(
    private readonly sessionStreamerService: SessionStreamerService,
  ) {}

  @Get(':sessionId')
  @GetInviteInfoRoute('Get session info from invite link')
  @Public()
  async getInviteInfo(
    @Param('sessionId') sessionId: string,
  ): Promise<InviteInfoResponseDto> {
    return await this.sessionStreamerService.getInviteInfo(sessionId);
  }

  @Post(':sessionId/join')
  @JoinAsStreamerRoute('Join session as a streamer')
  async joinAsStreamer(
    @Param('sessionId') sessionId: string,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<SessionStreamerResponseDto> {
    return await this.sessionStreamerService.joinAsStreamer(
      sessionId,
      user.sub,
    );
  }
}
