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
export class ThresholdEventGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const campaignId = request.params.id;
    const thresholdEventId = request.params.thresholdEventId as string;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!thresholdEventId) {
      throw new BadRequestException('Threshold event id not provided');
    }

    const thresholdEvent = await this.prisma.campaignThresholdEvent.findUnique({
      where: { id: thresholdEventId },
    });

    if (!thresholdEvent) {
      throw new NotFoundException('Threshold event not found');
    }

    if (thresholdEvent.campaignId !== campaignId) {
      throw new ForbiddenException(
        'You do not have permission to access this threshold event',
      );
    }

    request.thresholdEvent = thresholdEvent;

    return true;
  }
}
