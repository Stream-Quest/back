import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithEventType } from '../../../interfaces/authenticated-request.interface';
import { EventType } from '../../../generated/prisma/client';

export const EventTypeContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): EventType => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithEventType>();

    return request.eventType;
  },
);
