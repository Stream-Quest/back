import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithResolution } from '../../../interfaces/authenticated-request.interface';
import { Resolution } from '../../../generated/prisma/client';

export const ResolutionContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Resolution => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithResolution>();

    return request.resolution;
  },
);
