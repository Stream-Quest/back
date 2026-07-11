import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session, SessionStreamer } from '../../generated/prisma/client';
import { SessionStreamerRepository } from './session-streamer.repository';
import { UpdateSessionStreamerDto } from './dto/update-session-streamer.dto';
import {
  DetailedSessionStreamerResponseDto,
  InviteInfoResponseDto,
  InviteLinkResponseDto,
  SessionStreamerResponseDto,
} from './dto/session-streamer-response.dto';

@Injectable()
export class SessionStreamerService {
  constructor(
    private readonly repository: SessionStreamerRepository,
    private readonly configService: ConfigService,
  ) {}

  async getSessionStreamerList(
    sessionId: string,
  ): Promise<DetailedSessionStreamerResponseDto[]> {
    return await this.repository.getSessionStreamerList(sessionId);
  }

  generateInviteLink(session: Session): InviteLinkResponseDto {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return {
      inviteUrl: `${frontendUrl}/invite/${session.id}`,
      sessionId: session.id,
    };
  }

  async getInviteInfo(sessionId: string): Promise<InviteInfoResponseDto> {
    const session = await this.repository.getSessionWithCampaign(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return {
      sessionId: session.id,
      sessionTitle: session.title,
      campaignTitle: session.campaign.title,
      gmUsername: session.campaign.gameMaster.username,
    };
  }

  async joinAsStreamer(
    sessionId: string,
    userId: string,
  ): Promise<SessionStreamerResponseDto> {
    const session = await this.repository.getSessionWithCampaign(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const existing = await this.repository.getSessionStreamerByUserAndSession(
      userId,
      sessionId,
    );

    if (existing) {
      throw new ConflictException('You are already a streamer in this session');
    }

    return await this.repository.createSessionStreamer(sessionId, userId);
  }

  async updateSessionStreamer(
    dto: UpdateSessionStreamerDto,
    streamer: SessionStreamer,
  ): Promise<SessionStreamerResponseDto> {
    return await this.repository.updateSessionStreamer(streamer.id, dto);
  }

  async deleteSessionStreamer(
    streamer: SessionStreamer,
  ): Promise<SessionStreamer> {
    return await this.repository.deleteSessionStreamer(streamer.id);
  }
}
