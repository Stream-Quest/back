import { applyDecorators, UseGuards } from '@nestjs/common';
import { CampaignResponseDto } from '../dto/campaign-response.dto';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import { CampaignGuard } from '../guard/campaign.guard';
import {
  customErrorResponse,
  multipleErrorResponses,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import { FilterDeletionStatus } from '../../../enum/filter-status.enum';
import {
  CampaignEventResponseDto,
  DetailedCampaignEventResponseDto,
} from '../../campaign-event/dto/campaign-event-response.dto';
import { CampaignEventGuard } from '../../campaign-event/guard/campaign-event.guard';

const CAMPAIGN_ID_PARAM = {
  name: 'id',
  description: 'Campaign ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const CAMPAIGN_EVENT_ID_PARAM = {
  name: 'campaignEventId',
  description: 'CampaignEvent ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const CAMPAIGN_OWNERSHIP_GUARD_EXCEPTIONS = [
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

export function GetCampaignListRoute(summary: string) {
  return ApiAuthRoute(summary, {
    queries: [
      {
        name: 'status',
        enum: FilterDeletionStatus,
        description: 'Filter campaigns by deletion status',
        example: FilterDeletionStatus.ACTIVE,
        required: false,
      },
      ...PAGINATION_QUERIES,
    ],
    responses: [
      {
        status: 200,
        description: 'Returns the list of campaigns of the logged user',
        type: [CampaignResponseDto],
      },
    ],
  });
}

export function GetCampaignDetailsRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [CAMPAIGN_ID_PARAM],
    responses: [
      {
        status: 200,
        description: 'Campaign returned',
        type: CampaignResponseDto,
      },
      customErrorResponse(400, 'Campaign id not provided', 'Bad Request'),
      customErrorResponse(404, 'Campaign not found', 'Not found'),
    ],
  });
}

export function CreateCampaignRoute(summary: string) {
  return ApiAuthRoute(summary, {
    responses: [
      { status: 201, type: CampaignResponseDto },
      customErrorResponse(
        400,
        'Chaos threshold must be less than Blessing threshold',
        'Threshold validation not reached',
      ),
    ],
  });
}

export function UpdateCampaignRoute(summary: string) {
  return createOwnershipRoute(
    summary,
    'Updates and returns the updated campaign',
  );
}

export function UpdateCampaignStatusRoute(summary: string) {
  return createOwnershipRoute(
    summary,
    'Updates the status of a campaign and returns the updated campaign',
  );
}

export function UpdateCampaignKarmaRoute(summary: string) {
  return createOwnershipRoute(
    summary,
    'Updates the karma of a campaign and returns the updated campaign',
  );
}

export function SoftRemoveCampaignRoute(summary: string) {
  return createOwnershipRoute(summary, 'Soft remove a campaign');
}

export function RestoreSoftRemovedCampaignRoute(summary: string) {
  return createOwnershipRoute(
    summary,
    'Restore a campaign that has been soft removed',
  );
}

export function DeleteCampaignFromTrashRoute(summary: string) {
  return createOwnershipRoute(
    summary,
    'Permanently delete a campaign that has been soft removed',
  );
}

function createOwnershipRoute(
  summary: string,
  description: string,
  extraOptions = {},
) {
  return applyDecorators(
    UseGuards(CampaignGuard),
    ApiAuthRoute(summary, {
      params: [CAMPAIGN_ID_PARAM],
      responses: [
        { status: 200, description, type: CampaignResponseDto },
        ...CAMPAIGN_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
      ...extraOptions,
    }),
  );
}

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
