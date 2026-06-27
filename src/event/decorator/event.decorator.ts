import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithEvent } from '../../interfaces/authenticated-request.interface';
import { Event } from '../../generated/prisma/client';

export const EventContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Event => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithEvent>();

    return request.event;
  },
);
