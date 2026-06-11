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
export class WeatherGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const weatherId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!weatherId) {
      throw new BadRequestException('Weather id not provided');
    }

    const weather = await this.prisma.weather.findUnique({
      where: { id: weatherId as string },
    });

    if (!weather) {
      throw new NotFoundException('Weather not found');
    }

    request.weather = weather;

    return true;
  }
}
