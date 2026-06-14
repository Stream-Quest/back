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
export class PlayerCharacterGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const playerCharacterId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!playerCharacterId) {
      throw new BadRequestException('PlayerCharacter id not provided');
    }

    const playerCharacter = await this.prisma.playerCharacter.findUnique({
      where: { id: playerCharacterId as string },
    });

    if (!playerCharacter) {
      throw new NotFoundException('PlayerCharacter not found');
    }

    request.playerCharacter = playerCharacter;

    return true;
  }
}
