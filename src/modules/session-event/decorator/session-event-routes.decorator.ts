import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiPaginatedResponse,
  customErrorResponse,
  multipleErrorResponses,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import { SessionGuard } from '../../session/guard/session.guard';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import { SessionEventStatus } from '../../../generated/prisma/enums';
import {
  DetailedSessionEventResponseDto,
  SessionEventResponseDto,
} from '../dto/session-event-response.dto';
import { SessionEventGuard } from '../guard/session-event.guard';

const SESSION_EVENT_ID_PARAM = {
  name: 'sessionEventId',
  description: 'SessionEvent ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const SESSION_ID_PARAM = {
  name: 'id',
  description: 'Session ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

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
      responses: [...SESSION_GUARD_EXCEPTIONS],
    }),
    ApiPaginatedResponse(SessionEventResponseDto, {
      description: 'Returns the list of session events',
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
