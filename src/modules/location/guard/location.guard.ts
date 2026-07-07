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
export class LocationGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const locationId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!locationId) {
      throw new BadRequestException('Location id not provided');
    }

    const location = await this.prisma.location.findUnique({
      where: { id: locationId as string },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    request.location = location;

    return true;
  }
}
