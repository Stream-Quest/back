import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TwitchEventMapping } from '../../generated/prisma/client';

export const TwitchMappingContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TwitchEventMapping => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.twitchMapping as TwitchEventMapping;
  },
);
