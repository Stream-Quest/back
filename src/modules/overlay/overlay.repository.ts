import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OverlayRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(sessionId: string) {
    return this.prisma.sessionEvent.findMany({
      where: { sessionId },
      orderBy: { triggeredAt: 'desc' },
      take: 20,
    });
  }

  async getSessionCampaignKarma(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        campaign: {
          select: {
            karmaValue: true,
            chaosThreshold: true,
            blessingThreshold: true,
          },
        },
      },
    });

    return session?.campaign ?? null;
  }

  async getLatestContextSnapshot(sessionId: string) {
    return this.prisma.contextSnapshot.findFirst({
      where: { sessionId },
      orderBy: { snapshotAt: 'desc' },
      include: { weather: true, location: true },
    });
  }

  async getActivePlayers(sessionId: string) {
    return this.prisma.sessionPlayerCharacter.findMany({
      where: { sessionId, status: 'ACTIVE' },
      include: { playerCharacter: true },
    });
  }

  async getSessionCampaignId(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { campaignId: true },
    });

    return session?.campaignId ?? null;
  }

  async getMilestones(campaignId: string) {
    return this.prisma.twitchEventMapping.findMany({
      where: { campaignId, isActive: true, showProgress: true },
      include: { event: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
