import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import {
  customErrorResponse,
  multipleErrorResponses,
} from '../../../helpers/swagger.helper';
import {
  DetailedSessionStreamerResponseDto,
  InviteLinkResponseDto,
  InviteInfoResponseDto,
  SessionStreamerResponseDto,
} from '../dto/session-streamer-response.dto';
import { SessionStreamerGuard } from '../guard/session-streamer.guard';
import { SessionGuard } from '../../session/guard/session.guard';

const SESSION_ID_PARAM = {
  name: 'id',
  description: 'Session ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const STREAMER_ID_PARAM = {
  name: 'streamerId',
  description: 'SessionStreamer ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const SESSION_ID_INVITE_PARAM = {
  name: 'sessionId',
  description: 'Session ID used as invite token',
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

const STREAMER_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this streamer',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Streamer id not provided', 'Bad Request'),
  customErrorResponse(404, 'Streamer not found', 'Not Found'),
];

export function GetSessionStreamerListRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Returns the list of streamers for this session',
          type: [DetailedSessionStreamerResponseDto],
        },
        ...SESSION_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function GenerateInviteLinkRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Returns an invite link for this session',
          type: InviteLinkResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function UpdateSessionStreamerRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionStreamerGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, STREAMER_ID_PARAM],
      responses: [
        {
          status: 200,
          description:
            'Updates overlay permissions and player character assignment',
          type: SessionStreamerResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...STREAMER_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function DeleteSessionStreamerRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionStreamerGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, STREAMER_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Removes a streamer from the session',
          type: SessionStreamerResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...STREAMER_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function GetInviteInfoRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [SESSION_ID_INVITE_PARAM],
    responses: [
      {
        status: 200,
        description: 'Returns session info for the invite page (public)',
        type: InviteInfoResponseDto,
      },
      customErrorResponse(404, 'Session not found', 'Not Found'),
    ],
  });
}

export function JoinAsStreamerRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [SESSION_ID_INVITE_PARAM],
    responses: [
      {
        status: 201,
        description: 'Joins the session as a streamer',
        type: SessionStreamerResponseDto,
      },
      customErrorResponse(404, 'Session not found', 'Not Found'),
      customErrorResponse(
        409,
        'Already a streamer in this session',
        'Conflict',
      ),
    ],
  });
}
