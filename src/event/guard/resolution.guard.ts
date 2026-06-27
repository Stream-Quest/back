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
export class ResolutionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const eventId = request.params.id;
    const resolutionId = request.params.resolutionId as string;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!resolutionId) {
      throw new BadRequestException('Resolution id not provided');
    }

    const resolution = await this.prisma.resolution.findUnique({
      where: { id: resolutionId },
    });

    if (!resolution) {
      throw new NotFoundException('Resolution not found');
    }

    if (resolution.eventId !== eventId) {
      throw new ForbiddenException(
        'You do not have permission to access this resolution',
      );
    }

    request.resolution = resolution;

    return true;
  }
}
