import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class TwitchMappingGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const campaignId = request.params.id;
    const mappingId = request.params.mappingId as string;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!mappingId) {
      throw new BadRequestException('Twitch mapping id not provided');
    }

    const mapping = await this.prisma.twitchEventMapping.findUnique({
      where: { id: mappingId },
    });

    if (!mapping) {
      throw new NotFoundException('Twitch mapping not found');
    }

    if (mapping.campaignId !== campaignId) {
      throw new ForbiddenException(
        'You do not have permission to access this twitch mapping',
      );
    }

    request.twitchMapping = mapping;

    return true;
  }
}
