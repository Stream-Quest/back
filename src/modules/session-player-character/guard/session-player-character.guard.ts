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
export class SessionPlayerCharacterGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.params.id;
    const spcId = request.params.spcId as string;

    if (!spcId) {
      throw new BadRequestException('SessionPlayerCharacter id not provided');
    }

    const spc = await this.prisma.sessionPlayerCharacter.findUnique({
      where: { id: spcId },
    });

    if (!spc) {
      throw new NotFoundException('SessionPlayerCharacter not found');
    }

    if (spc.sessionId !== sessionId) {
      throw new ForbiddenException(
        'You do not have permission to access this player character',
      );
    }

    request.sessionPlayerCharacter = spc;
    return true;
  }
}
