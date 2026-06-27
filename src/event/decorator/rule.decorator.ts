import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithRule } from '../../interfaces/authenticated-request.interface';
import { Rule } from '../../generated/prisma/client';

export const RuleContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Rule => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithRule>();

    return request.rule;
  },
);
