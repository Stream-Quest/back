import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class CampaignEventGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const campaignId = request.params.id;
    const campaignEventId = request.params.campaignEventId as string;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!campaignEventId) {
      throw new BadRequestException('Campaign event id not provided');
    }

    const campaignEvent = await this.prisma.campaignEvent.findUnique({
      where: { id: campaignEventId },
    });

    if (!campaignEvent) {
      throw new NotFoundException('Campaign event not found');
    }

    if (campaignEvent.campaignId !== campaignId) {
      throw new ForbiddenException(
        'You do not have permission to access this campaign event',
      );
    }

    request.campaignEvent = campaignEvent;

    return true;
  }
}
