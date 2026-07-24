import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import { SessionGuard } from '../../session/guard/session.guard';
import { SessionPlayerCharacterGuard } from '../guard/session-player-character.guard';
import {
  customErrorResponse,
  multipleErrorResponses,
} from '../../../helpers/swagger.helper';
import {
  DetailedSessionPlayerCharacterResponseDto,
  SessionPlayerCharacterResponseDto,
} from '../dto/session-player-character-response.dto';

const SESSION_ID_PARAM = {
  name: 'id',
  description: 'Session ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const SPC_ID_PARAM = {
  name: 'spcId',
  description: 'SessionPlayerCharacter ID',
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

const SPC_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this player character',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(
    400,
    'SessionPlayerCharacter id not provided',
    'Bad Request',
  ),
  customErrorResponse(404, 'SessionPlayerCharacter not found', 'Not Found'),
];

export function GetSessionPlayerCharacterListRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM],
      responses: [
        {
          status: 200,
          description:
            'Returns the list of active player characters for this session',
          type: [DetailedSessionPlayerCharacterResponseDto],
        },
        ...SESSION_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function CreateSessionPlayerCharacterRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Adds a player character to the session',
          type: SessionPlayerCharacterResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        customErrorResponse(404, 'PlayerCharacter not found', 'Not Found'),
      ],
    }),
  );
}

export function UpdateSessionPlayerCharacterRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionPlayerCharacterGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, SPC_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Updates HP and status — broadcasts to OBS overlay',
          type: SessionPlayerCharacterResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...SPC_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function RemoveSessionPlayerCharacterRoute(summary: string) {
  return applyDecorators(
    UseGuards(SessionGuard, SessionPlayerCharacterGuard),
    ApiAuthRoute(summary, {
      params: [SESSION_ID_PARAM, SPC_ID_PARAM],
      responses: [
        {
          status: 200,
          description:
            'Removes a player character from the session (soft delete)',
          type: SessionPlayerCharacterResponseDto,
        },
        ...SESSION_GUARD_EXCEPTIONS,
        ...SPC_GUARD_EXCEPTIONS,
      ],
    }),
  );
}
