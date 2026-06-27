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
export class RuleGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const eventId = request.params.id;
    const ruleId = request.params.ruleId as string;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!ruleId) {
      throw new BadRequestException('Rule id not provided');
    }

    const rule = await this.prisma.rule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new NotFoundException('Rule not found');
    }

    if (rule.eventId !== eventId) {
      throw new ForbiddenException(
        'You do not have permission to access this rule',
      );
    }

    request.rule = rule;

    return true;
  }
}
