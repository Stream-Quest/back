import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiQuery,
  ApiQueryOptions,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../dto/error-response.dto';
import {
  customErrorResponse,
  multipleErrorResponses,
} from '../../../helpers/swagger.helper';
import { OverlayGuard } from '../guard/overlay.guard';
import {
  OverlayPermission,
  OverlayPermissionField,
} from './overlay-permission.decorator';
import { OverlayEventResponseDto } from '../dto/overlay-event-response.dto';
import { OverlayKarmaResponseDto } from '../dto/overlay-karma-response.dto';
import { OverlayContextResponseDto } from '../dto/overlay-context-response.dto';
import { OverlayPlayerResponseDto } from '../dto/overlay-player-response.dto';
import { OverlayMilestoneResponseDto } from '../dto/overlay-milestone-response.dto';

interface ApiOverlayRouteOptions {
  responses?: ApiResponseOptions[];
  queries?: ApiQueryOptions[];
  params?: ApiParamOptions[];
}

const OVERLAY_TOKEN_QUERY: ApiQueryOptions = {
  name: 'token',
  description: 'Overlay access token identifying the streamer',
  example: '3f9c1e2a-7b4d-4e2f-9a1c-8d6b2f5e9c0a',
  required: true,
};

const OVERLAY_SESSION_ID_PARAM: ApiParamOptions = {
  name: 'sessionId',
  description: 'Session ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
  required: true,
};

function overlayGuardErrorResponses(
  permissionField: OverlayPermissionField,
): ApiResponseOptions[] {
  return [
    multipleErrorResponses(
      400,
      [
        { summary: 'Missing token', message: 'Overlay token not provided' },
        { summary: 'Missing session id', message: 'Session id not provided' },
      ],
      'Bad Request',
    ),
    multipleErrorResponses(
      403,
      [
        { summary: 'Invalid token', message: 'Invalid overlay token' },
        {
          summary: 'Missing permission',
          message: `Missing overlay permission: ${permissionField}`,
        },
      ],
      'Forbidden',
    ),
    customErrorResponse(404, 'Not attached to this session', 'Not found'),
  ];
}

export function ApiOverlayRoute(
  summary: string,
  permissionField: OverlayPermissionField,
  options: ApiOverlayRouteOptions = {},
) {
  return applyDecorators(
    UseGuards(OverlayGuard),
    OverlayPermission(permissionField),
    ApiOperation({ summary }),
    ApiQuery(OVERLAY_TOKEN_QUERY),
    ApiParam(OVERLAY_SESSION_ID_PARAM),
    ...(options.queries ?? []).map((q) => ApiQuery(q)),
    ...(options.params ?? []).map((p) => ApiParam(p)),
    ...overlayGuardErrorResponses(permissionField).map((r) => ApiResponse(r)),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
    ...(options.responses ?? []).map((r) => ApiResponse(r)),
  );
}

export function GetOverlayEventsRoute(summary: string) {
  return ApiOverlayRoute(summary, 'canViewEvents', {
    responses: [
      {
        status: 200,
        description: 'Returns the list of the 20 most recent session events',
        type: [OverlayEventResponseDto],
      },
    ],
  });
}

export function GetOverlayKarmaRoute(summary: string) {
  return ApiOverlayRoute(summary, 'canViewKarma', {
    responses: [
      {
        status: 200,
        description:
          "Returns the session's campaign karma, or null if the session has no campaign",
        type: OverlayKarmaResponseDto,
      },
    ],
  });
}

export function GetOverlayContextRoute(summary: string) {
  return ApiOverlayRoute(summary, 'canViewContext', {
    responses: [
      {
        status: 200,
        description:
          'Returns the latest context snapshot, or null if none exists',
        type: OverlayContextResponseDto,
      },
    ],
  });
}

export function GetOverlayPlayersRoute(summary: string) {
  return ApiOverlayRoute(summary, 'canViewPlayers', {
    responses: [
      {
        status: 200,
        description: 'Returns the list of active player characters',
        type: [OverlayPlayerResponseDto],
      },
    ],
  });
}

export function GetOverlayMilestonesRoute(summary: string) {
  return ApiOverlayRoute(summary, 'canViewMilestones', {
    responses: [
      {
        status: 200,
        description:
          'Returns the list of active campaign milestones, or an empty list if the session has no campaign',
        type: [OverlayMilestoneResponseDto],
      },
    ],
  });
}
