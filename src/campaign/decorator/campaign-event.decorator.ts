import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithCampaignEvent } from '../../interfaces/authenticated-request.interface';
import { CampaignEvent } from '../../generated/prisma/client';

export const CampaignEventContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CampaignEvent => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithCampaignEvent>();
    return request.campaignEvent;
  },
);
