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
export class SessionStreamerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const sessionId = request.params.id;
    const streamerId = request.params.streamerId as string;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!streamerId) {
      throw new BadRequestException('Streamer id not provided');
    }

    const streamer = await this.prisma.sessionStreamer.findUnique({
      where: { id: streamerId },
    });

    if (!streamer) {
      throw new NotFoundException('Streamer not found');
    }

    if (streamer.sessionId !== sessionId) {
      throw new ForbiddenException(
        'You do not have permission to access this streamer',
      );
    }

    request.sessionStreamer = streamer;
    return true;
  }
}
