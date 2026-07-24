import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import {
  customErrorResponse,
  multipleErrorResponses,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import {
  CampaignEventResponseDto,
  DetailedCampaignEventResponseDto,
} from '../dto/campaign-event-response.dto';
import { CampaignEventGuard } from '../guard/campaign-event.guard';
import { CampaignGuard } from '../../campaign/guard/campaign.guard';
import {
  CAMPAIGN_ID_PARAM,
  CAMPAIGN_OWNERSHIP_GUARD_EXCEPTIONS,
} from '../../campaign/decorator/campaign-routes.decorator';

const CAMPAIGN_EVENT_ID_PARAM = {
  name: 'campaignEventId',
  description: 'CampaignEvent ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const CAMPAIGN_EVENT_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this campaign event',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Campaign event id not provided', 'Bad Request'),
  customErrorResponse(404, 'Campaign event not found', 'Not found'),
];

export function GetCampaignEventListRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM],
      queries: [...PAGINATION_QUERIES],
      responses: [
        {
          status: 200,
          description: 'Returns the list of events linked to the campaign',
          type: [CampaignEventResponseDto],
        },
        ...CAMPAIGN_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function GetCampaignEventDetailsRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, CampaignEventGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, CAMPAIGN_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Returns campaign event with full event details',
          type: DetailedCampaignEventResponseDto,
        },
        ...CAMPAIGN_OWNERSHIP_GUARD_EXCEPTIONS,
        ...CAMPAIGN_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function CreateCampaignEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Links an event to the campaign and returns the link',
          type: CampaignEventResponseDto,
        },
        ...CAMPAIGN_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function UpdateCampaignEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, CampaignEventGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, CAMPAIGN_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Updates and returns the campaign event',
          type: CampaignEventResponseDto,
        },
        ...CAMPAIGN_OWNERSHIP_GUARD_EXCEPTIONS,
        ...CAMPAIGN_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function DeleteCampaignEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, CampaignEventGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, CAMPAIGN_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Unlinks the event from the campaign',
          type: CampaignEventResponseDto,
        },
        ...CAMPAIGN_OWNERSHIP_GUARD_EXCEPTIONS,
        ...CAMPAIGN_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}
