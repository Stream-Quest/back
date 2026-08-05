import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import { CampaignGuard } from '../../campaign/guard/campaign.guard';
import { TwitchMappingGuard } from '../guard/twitch-mapping.guard';
import {
  ApiPaginatedResponse,
  customErrorResponse,
  multipleErrorResponses,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import {
  DetailedTwitchMappingResponseDto,
  TwitchMappingResponseDto,
} from '../dto/twitch-mapping-response.dto';
import { TriggerType } from '../../../generated/prisma/enums';

const CAMPAIGN_ID_PARAM = {
  name: 'id',
  description: 'Campaign ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const MAPPING_ID_PARAM = {
  name: 'mappingId',
  description: 'TwitchMapping ID',
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

const MAPPING_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this twitch mapping',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Twitch mapping id not provided', 'Bad Request'),
  customErrorResponse(404, 'Twitch mapping not found', 'Not Found'),
];

export function GetTwitchMappingListRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM],
      queries: [
        {
          name: 'twitchEventType',
          enum: TriggerType,
          description: 'Filter by Twitch event type',
          required: false,
        },
        {
          name: 'isActive',
          description: 'Filter by active status',
          required: false,
        },
        ...PAGINATION_QUERIES,
      ],
      responses: [...CAMPAIGN_GUARD_EXCEPTIONS],
    }),
    ApiPaginatedResponse(TwitchMappingResponseDto, {
      description: 'Returns twitch mappings for the campaign',
    }),
  );
}

export function GetTwitchMappingDetailsRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, TwitchMappingGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, MAPPING_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Returns a twitch mapping with event details',
          type: DetailedTwitchMappingResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        ...MAPPING_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function CreateTwitchMappingRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Creates and returns a twitch mapping',
          type: TwitchMappingResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        customErrorResponse(404, 'Event not found', 'Not Found'),
      ],
    }),
  );
}

export function UpdateTwitchMappingRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, TwitchMappingGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, MAPPING_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Updates and returns the twitch mapping',
          type: TwitchMappingResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        ...MAPPING_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function DeleteTwitchMappingRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, TwitchMappingGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, MAPPING_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Deletes the twitch mapping',
          type: TwitchMappingResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        ...MAPPING_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function ResetTwitchMappingCountRoute(summary: string) {
  return applyDecorators(
    UseGuards(CampaignGuard, TwitchMappingGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM, MAPPING_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Resets the event counter of the twitch mapping',
          type: TwitchMappingResponseDto,
        },
        ...CAMPAIGN_GUARD_EXCEPTIONS,
        ...MAPPING_GUARD_EXCEPTIONS,
      ],
    }),
  );
}
