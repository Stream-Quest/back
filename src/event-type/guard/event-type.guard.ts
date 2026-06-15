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
export class EventTypeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const eventTypeId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!eventTypeId) {
      throw new BadRequestException('EventType id not provided');
    }

    const eventType = await this.prisma.eventType.findUnique({
      where: { id: eventTypeId as string },
    });

    if (!eventType) {
      throw new NotFoundException('EventType not found');
    }

    request.eventType = eventType;

    return true;
  }
}
