import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import {
  customErrorResponse,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import { EventTypeResponseDto } from '../dto/event-type-response.dto';
import { EventTypeGuard } from '../guard/event-type.guard';

const EVENT_TYPE_ID_PARAM = {
  name: 'id',
  description: 'EventType ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const EVENT_TYPE_OWNERSHIP_GUARD_EXCEPTIONS = [
  customErrorResponse(403, 'User not authenticated', 'Forbidden'),
  customErrorResponse(400, 'EventType id not provided', 'Bad Request'),
  customErrorResponse(404, 'EventType not found', 'Not found'),
];

export function GetEventTypeListRoute(summary: string) {
  return ApiAuthRoute(summary, {
    queries: [...PAGINATION_QUERIES],
    responses: [
      {
        status: 200,
        description: 'Returns the list of event types',
        type: [EventTypeResponseDto],
      },
    ],
  });
}

export function GetEventTypeDetailsRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [EVENT_TYPE_ID_PARAM],
    responses: [
      {
        status: 200,
        description: 'Returns event type',
        type: EventTypeResponseDto,
      },
      customErrorResponse(400, 'EventType id not provided', 'Bad Request'),
      customErrorResponse(404, 'EventType not found', 'Not found'),
    ],
  });
}

export function CreateEventTypeRoute(summary: string) {
  return ApiAuthRoute(summary, {
    responses: [
      {
        status: 201,
        description: 'Create an event type and returns the created event type',
        type: EventTypeResponseDto,
      },
    ],
  });
}

export function UpdateEventTypeRoute(summary: string) {
  return eventTypeOwnershipRoute(
    summary,
    'Updates an event type and returns the updated event type',
  );
}

export function DeleteEventTypeRoute(summary: string) {
  return eventTypeOwnershipRoute(summary, 'Deletes an eventType');
}

function eventTypeOwnershipRoute(
  summary: string,
  description: string,
  extraOptions = {},
) {
  return applyDecorators(
    UseGuards(EventTypeGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_TYPE_ID_PARAM],
      responses: [
        {
          status: 200,
          description,
          type: EventTypeResponseDto,
        },
        ...EVENT_TYPE_OWNERSHIP_GUARD_EXCEPTIONS,
      ],
      ...extraOptions,
    }),
  );
}
