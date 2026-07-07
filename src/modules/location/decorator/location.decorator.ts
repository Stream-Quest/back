import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithLocation } from '../../../interfaces/authenticated-request.interface';
import { Location } from '../../../generated/prisma/client';

export const LocationContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Location => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithLocation>();

    return request.location;
  },
);
