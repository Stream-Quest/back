import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../auth/decorator/api-auth.decorator';
import {
  customErrorResponse,
  PAGINATION_QUERIES,
} from '../../helpers/swagger.helper';
import { WeatherResponseDto } from '../dto/weather-response.dto';
import { WeatherGuard } from '../guard/weather.guard';

const WEATHER_ID_PARAM = {
  name: 'id',
  description: 'Weather ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const WEATHER_OWNERSHIP_GUARD_EXCEPTIONS = [
  customErrorResponse(403, 'User not authenticated', 'Forbidden'),
  customErrorResponse(400, 'Weather id not provided', 'Bad Request'),
  customErrorResponse(404, 'Weather not found', 'Not found'),
];

export function GetWeatherListRoute(summary: string) {
  return ApiAuthRoute(summary, {
    queries: [...PAGINATION_QUERIES],
    responses: [
      {
        status: 200,
        description: 'Returns the list of weathers',
        type: [WeatherResponseDto],
      },
    ],
  });
}

export function GetWeatherDetailsRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [WEATHER_ID_PARAM],
    responses: [
      {
        status: 200,
        description: 'Returns weather',
        type: WeatherResponseDto,
      },
      customErrorResponse(400, 'Weather id not provided', 'Bad Request'),
      customErrorResponse(404, 'Weather not found', 'Not found'),
    ],
  });
}

export function CreateWeatherRoute(summary: string) {
  return ApiAuthRoute(summary, {
    responses: [
      {
        status: 201,
        description: 'Create a weather and returns the created weather',
        type: WeatherResponseDto,
      },
    ],
  });
}

export function UpdateWeatherRoute(summary: string) {
  return weatherOwnershipRoute(
    summary,
    'Updates a weather and returns the updated weather',
  );
}

export function DeleteWeatherRoute(summary: string) {
  return weatherOwnershipRoute(summary, 'Deletes a weather');
}

function weatherOwnershipRoute(
  summary: string,
  description: string,
  extraOptions = {},
) {
  return applyDecorators(
    UseGuards(WeatherGuard),
    ApiAuthRoute(summary, {
      params: [WEATHER_ID_PARAM],
      responses: [
        {
          status: 200,
          description,
          type: WeatherResponseDto,
        },
        ...WEATHER_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
      ...extraOptions,
    }),
  );
}
