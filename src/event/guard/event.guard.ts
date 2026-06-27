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
export class EventGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const eventId = request.params.id as string;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!eventId) {
      throw new BadRequestException('Event id not provided');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.gameMasterId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this event',
      );
    }

    request.event = event;

    return true;
  }
}
