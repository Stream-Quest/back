import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import {
  ApiPaginatedResponse,
  customErrorResponse,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import { PlayerCharacterResponseDto } from '../dto/player-character-response.dto';
import { PlayerCharacterGuard } from '../guard/player-character.guard';

const PLAYER_CHARACTER_ID_PARAM = {
  name: 'id',
  description: 'PlayerCharacter ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const PLAYER_CHARACTER_OWNERSHIP_GUARD_EXCEPTIONS = [
  customErrorResponse(403, 'User not authenticated', 'Forbidden'),
  customErrorResponse(400, 'PlayerCharacter id not provided', 'Bad Request'),
  customErrorResponse(404, 'PlayerCharacter not found', 'Not found'),
];

export function GetPlayerCharacterListRoute(summary: string) {
  return applyDecorators(
    ApiAuthRoute(summary, {
      queries: [...PAGINATION_QUERIES],
    }),
    ApiPaginatedResponse(PlayerCharacterResponseDto, {
      description: 'Returns the list of player characters',
    }),
  );
}

export function GetPlayerCharacterDetailsRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [PLAYER_CHARACTER_ID_PARAM],
    responses: [
      {
        status: 200,
        description: 'Returns player character',
        type: PlayerCharacterResponseDto,
      },
      customErrorResponse(
        400,
        'PlayerCharacter id not provided',
        'Bad Request',
      ),
      customErrorResponse(404, 'PlayerCharacter not found', 'Not found'),
    ],
  });
}

export function CreatePlayerCharacterRoute(summary: string) {
  return ApiAuthRoute(summary, {
    responses: [
      {
        status: 201,
        description:
          'Create a player character and returns the created player character',
        type: PlayerCharacterResponseDto,
      },
    ],
  });
}

export function UpdatePlayerCharacterRoute(summary: string) {
  return playerCharacterOwnershipRoute(
    summary,
    'Updates a player character and returns the updated player character',
  );
}

export function DeletePlayerCharacterRoute(summary: string) {
  return playerCharacterOwnershipRoute(summary, 'Deletes a playerCharacter');
}

function playerCharacterOwnershipRoute(
  summary: string,
  description: string,
  extraOptions = {},
) {
  return applyDecorators(
    UseGuards(PlayerCharacterGuard),
    ApiAuthRoute(summary, {
      params: [PLAYER_CHARACTER_ID_PARAM],
      responses: [
        {
          status: 200,
          description,
          type: PlayerCharacterResponseDto,
        },
        ...PLAYER_CHARACTER_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
      ...extraOptions,
    }),
  );
}
