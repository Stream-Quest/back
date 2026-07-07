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
export class SessionEventGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const sessionId = request.params.id;
    const sessionEventId = request.params.sessionEventId as string;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!sessionEventId) {
      throw new BadRequestException('Session event id not provided');
    }

    const sessionEvent = await this.prisma.sessionEvent.findUnique({
      where: { id: sessionEventId },
    });

    if (!sessionEvent) {
      throw new NotFoundException('Session event not found');
    }

    if (sessionEvent.sessionId !== sessionId) {
      throw new ForbiddenException(
        'You do not have permission to access this session event',
      );
    }

    request.sessionEvent = sessionEvent;

    return true;
  }
}
