import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  OVERLAY_PERMISSION_KEY,
  OverlayPermissionField,
} from '../decorator/overlay-permission.decorator';

@Injectable()
export class OverlayGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.query.token as string;
    const sessionId = request.params.sessionId as string;

    if (!token) {
      throw new BadRequestException('Overlay token not provided');
    }
    if (!sessionId) {
      throw new BadRequestException('Session id not provided');
    }

    const user = await this.prisma.user.findUnique({
      where: { overlayToken: token },
    });
    if (!user) {
      throw new ForbiddenException('Invalid overlay token');
    }

    const sessionStreamer = await this.prisma.sessionStreamer.findUnique({
      where: { sessionId_userId: { sessionId, userId: user.id } },
    });
    if (!sessionStreamer) {
      throw new NotFoundException('Not attached to this session');
    }

    const requiredField = this.reflector.get<OverlayPermissionField>(
      OVERLAY_PERMISSION_KEY,
      context.getHandler(),
    );
    if (requiredField && !sessionStreamer[requiredField]) {
      throw new ForbiddenException(
        `Missing overlay permission: ${requiredField}`,
      );
    }

    request.overlayContext = { user, sessionStreamer };
    return true;
  }
}
