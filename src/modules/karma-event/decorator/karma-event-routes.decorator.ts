import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import { CampaignGuard } from '../../campaign/guard/campaign.guard';
import { ThresholdEventGuard } from '../../threshold-event/guard/threshold-event.guard';
import {
  ApiPaginatedResponse,
  customErrorResponse,
  multipleErrorResponses,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import {
  DetailedThresholdEventResponseDto,
  ThresholdEventResponseDto,
} from '../../threshold-event/dto/threshold-event-response.dto';
import { ThresholdType } from '../../../generated/prisma/enums';
import { KarmaEventResponseDto } from '../dto/karma-event-response.dto';

const CAMPAIGN_ID_PARAM = {
  name: 'id',
  description: 'Campaign ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const THRESHOLD_EVENT_ID_PARAM = {
  name: 'thresholdEventId',
  description: 'ThresholdEvent ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const CAMPAIGN_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this campaign',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Campaign id not provided', 'Bad Request'),
  customErrorResponse(404, 'Campaign not found', 'Not Found'),
];

const THRESHOLD_EVENT_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this threshold event',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Threshold event id not provided', 'Bad Request'),
  customErrorResponse(404, 'Threshold event not found', 'Not Found'),
];

// ─── KarmaEvent routes ────────────────────────────────────────────────────────

export function GetKarmaEventListRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM],
      queries: [
        {
          name: 'sessionId',
          description: 'Filter by session',
          example: '550e8400-e29b-41d4-a716-446655440000',
          required: false,
        },
        ...PAGINATION_QUERIES,
      ],
      responses: [...CAMPAIGN_GUARD_EXCEPTIONS],
    }),
    ApiPaginatedResponse(KarmaEventResponseDto, {
      description: 'Returns the karma history of the campaign',
    }),
  );
}

export function GetKarmaEventDetailsRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [
        CAMPAIGN_ID_PARAM,
        {
          name: 'karmaEventId',
          description: 'KarmaEvent ID',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      ],
      responses: [
        {
          status: 200,
          description: 'Returns a karma event',
          type: KarmaEventResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        customErrorResponse(404, 'KarmaEvent not found', 'Not Found'),
      ],
    }),
  );
}

// ─── ThresholdEvent routes ────────────────────────────────────────────────────

export function GetThresholdEventListRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM],
      queries: [
        {
          name: 'thresholdType',
          enum: ThresholdType,
          description: 'Filter by threshold type',
          example: ThresholdType.CHAOS,
          required: false,
        },
        ...PAGINATION_QUERIES,
      ],
      responses: [...CAMPAIGN_GUARD_EXCEPTIONS],
    }),
    ApiPaginatedResponse(ThresholdEventResponseDto, {
      description: 'Returns the threshold events of the campaign',
    }),
  );
}

export function GetThresholdEventDetailsRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, ThresholdEventGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, THRESHOLD_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Returns a threshold event with full event details',
          type: DetailedThresholdEventResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        ...THRESHOLD_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function CreateThresholdEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Creates a threshold event and returns it',
          type: ThresholdEventResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        customErrorResponse(404, 'Event not found', 'Not Found'),
      ],
    }),
  );
}

export function UpdateThresholdEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, ThresholdEventGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, THRESHOLD_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Updates and returns the threshold event',
          type: ThresholdEventResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        ...THRESHOLD_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function DeleteThresholdEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, ThresholdEventGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, THRESHOLD_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Deletes the threshold event',
          type: ThresholdEventResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        ...THRESHOLD_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}
