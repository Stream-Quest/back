import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import {
  customErrorResponse,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import { LocationResponseDto } from '../dto/location-response.dto';
import { LocationGuard } from '../guard/location.guard';

const LOCATION_ID_PARAM = {
  name: 'id',
  description: 'Location ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const LOCATION_OWNERSHIP_GUARD_EXCEPTIONS = [
  customErrorResponse(403, 'User not authenticated', 'Forbidden'),
  customErrorResponse(400, 'Location id not provided', 'Bad Request'),
  customErrorResponse(404, 'Location not found', 'Not found'),
];

export function GetLocationListRoute(summary: string) {
  return ApiAuthRoute(summary, {
    queries: [...PAGINATION_QUERIES],
    responses: [
      {
        status: 200,
        description: 'Returns the list of locations',
        type: [LocationResponseDto],
      },
    ],
  });
}

export function GetLocationDetailsRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [LOCATION_ID_PARAM],
    responses: [
      {
        status: 200,
        description: 'Returns location',
        type: LocationResponseDto,
      },
      customErrorResponse(400, 'Location id not provided', 'Bad Request'),
      customErrorResponse(404, 'Location not found', 'Not found'),
    ],
  });
}

export function CreateLocationRoute(summary: string) {
  return ApiAuthRoute(summary, {
    responses: [
      {
        status: 201,
        description: 'Create a location and returns the created location',
        type: LocationResponseDto,
      },
    ],
  });
}

export function UpdateLocationRoute(summary: string) {
  return locationOwnershipRoute(
    summary,
    'Updates a location and returns the updated location',
  );
}

export function DeleteLocationRoute(summary: string) {
  return locationOwnershipRoute(summary, 'Deletes a location');
}

function locationOwnershipRoute(
  summary: string,
  description: string,
  extraOptions = {},
) {
  return applyDecorators(
    UseGuards(LocationGuard),
    ApiAuthRoute(summary, {
      params: [LOCATION_ID_PARAM],
      responses: [
        {
          status: 200,
          description,
          type: LocationResponseDto,
        },
        ...LOCATION_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
      ...extraOptions,
    }),
  );
}
