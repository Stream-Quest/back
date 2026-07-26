import { Injectable } from '@nestjs/common';
import { OverlayRepository } from './overlay.repository';

@Injectable()
export class OverlayService {
  constructor(private readonly repository: OverlayRepository) {}

  async getEvents(sessionId: string) {
    return this.repository.getEvents(sessionId);
  }

  async getKarma(sessionId: string) {
    return this.repository.getSessionCampaignKarma(sessionId);
  }

  async getContext(sessionId: string) {
    return this.repository.getLatestContextSnapshot(sessionId);
  }

  async getPlayers(sessionId: string) {
    return this.repository.getActivePlayers(sessionId);
  }

  async getMilestones(sessionId: string) {
    const campaignId = await this.repository.getSessionCampaignId(sessionId);

    if (!campaignId) return [];

    return this.repository.getMilestones(campaignId);
  }
}
