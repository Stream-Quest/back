import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import { SessionStatus } from '../../../generated/prisma/enums';
import {
  customErrorResponse,
  multipleErrorResponses,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import { SessionResponseDto } from '../dto/session-response.dto';
import { SessionGuard } from '../guard/session.guard';
import { ContextSnapshotResponseDto } from '../dto/context-snapshot-response.dto';
import { SessionEventGuard } from '../../session-event/guard/session-event.guard';
import {
  DetailedSessionEventResponseDto,
  SessionEventResponseDto,
} from '../../session-event/dto/session-event-response.dto';
import { SessionEventStatus } from '../../../generated/prisma/enums';

const SESSION_ID_PARAM = {
  name: 'id',
  description: 'Session ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const SESSION_EVENT_ID_PARAM = {
  name: 'sessionEventId',
  description: 'SessionEvent ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const SESSION_OWNERSHIP_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this session',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Session id not provided', 'Bad Request'),
  multipleErrorResponses(404, [
    { summary: 'Not Found', message: 'Session not found' },
    { summary: 'Not Found', message: 'Campaign not found' },
  ]),
];

const SESSION_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this session',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Session id not provided', 'Bad Request'),
  customErrorResponse(404, 'Session not found', 'Not Found'),
];

const SESSION_EVENT_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this session event',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Session event id not provided', 'Bad Request'),
  customErrorResponse(404, 'Session event not found', 'Not Found'),
];

export function GetSessionListRoute(summary: string) {
  return ApiAuthRoute(summary, {
    queries: [
      {
        name: 'status',
        enum: SessionStatus,
        description: 'Filter sessions by status',
        example: SessionStatus.LIVE,
        required: false,
      },
      {
        name: 'campaignId',
        description: "Filter a campaign's sessions",
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false,
      },
      ...PAGINATION_QUERIES,
    ],
    responses: [
      {
        status: 200,
        description: 'Returns the list of sessions for a campaign',
        type: [SessionResponseDto],
      },
    ],
  });
}

export function GetSessionDetailsRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [SESSION_ID_PARAM],
    responses: [
      {
        status: 200,
        description: 'Returns session',
        type: SessionResponseDto,
      },
      customErrorResponse(400, 'Session id not provided', 'Bad Request'),
      customErrorResponse(404, 'Session not found', 'Not Found'),
    ],
  });
}

export function CreateSessionRoute(summary: string) {
  return ApiAuthRoute(summary, {
    responses: [{ status: 201, type: SessionResponseDto }],
  });
}

export function UpdateSessionRoute(summary: string) {
  return sessionOwnershipRoute(
    summary,
    'Updates and returns the updated session',
  );
}

export function UpdateSessionStatusRoute(summary: string) {
  return sessionOwnershipRoute(
    summary,
    'Updates the status of a session and returns the updated session',
  );
}

export function StartSessionRoute(summary: string) {
  return sessionOwnershipRoute(
    summary,
    'Starts a session by updating the status',
  );
}

export function EndSessionRoute(summary: string) {
  return sessionOwnershipRoute(
    summary,
    'Ends a session by updating the status',
  );
}

export function GetContextSnapshotsRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Returns the list of context snapshots for a session',
          type: [ContextSnapshotResponseDto],
        },
        ...SESSION_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function UpdateContextSnapshotRoute(summary: string) {
  return sessionOwnershipRoute(
    summary,
    'Updates a session to create a snapshot of it',
  );
}

export function DeleteSessionRoute(summary: string) {
  return sessionOwnershipRoute(summary, 'Deletes a session');
}

function sessionOwnershipRoute(
  summary: string,
  description: string,
  extraOptions = {},
) {
  return applyDecorators(
    UseGuards(SessionGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM],
      responses: [
        { status: 200, description, type: SessionResponseDto },
        ...SESSION_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
      ...extraOptions,
    }),
  );
}

export function GetSessionEventListRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM],
      queries: [
        {
          name: 'status',
          enum: SessionEventStatus,
          description: 'Filter by status',
          example: SessionEventStatus.PENDING,
          required: false,
        },
        ...PAGINATION_QUERIES,
      ],
      responses: [
        {
          status: 200,
          description: 'Returns the list of session events',
          type: [SessionEventResponseDto],
        },
        ...SESSION_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function GetSessionEventDetailsRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionEventGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, SESSION_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Returns session event with full details',
          type: DetailedSessionEventResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...SESSION_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function CreateSessionEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Creates a session event and broadcasts to GM dashboard',
          type: SessionEventResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        customErrorResponse(404, 'Event not found', 'Not Found'),
      ],
    }),
  );
}

export function UpdateSessionEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionEventGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, SESSION_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description:
            'Updates the session event (event swap or message override)',
          type: SessionEventResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...SESSION_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function ValidateSessionEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionEventGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, SESSION_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'GM validates the event — broadcasts to OBS overlay',
          type: SessionEventResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...SESSION_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function RejectSessionEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionEventGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, SESSION_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'GM rejects the event — removed from veto queue',
          type: SessionEventResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...SESSION_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function DeleteSessionEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionEventGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, SESSION_EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Deletes a session event',
          type: SessionEventResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...SESSION_EVENT_GUARD_EXCEPTIONS,
      ],
    }),
  );
}
