import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthRoute } from '../../../auth/decorator/api-auth.decorator';
import {
  ApiPaginatedResponse,
  customErrorResponse,
  multipleErrorResponses,
  PAGINATION_QUERIES,
} from '../../../helpers/swagger.helper';
import {
  DetailedEventResponseDto,
  EventResponseDto,
} from '../dto/event-response.dto';
import { ResolutionResponseDto } from '../../resolution/dto/resolution-response.dto';
import { RuleResponseDto } from '../../rule/dto/rule-response.dto';
import { EventGuard } from '../guard/event.guard';
import { ResolutionGuard } from '../../resolution/guard/resolution.guard';
import { RuleGuard } from '../../rule/guard/rule.guard';

const EVENT_ID_PARAM = {
  name: 'id',
  description: 'Event ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const RULE_ID_PARAM = {
  name: 'ruleId',
  description: 'Rule ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const RESOLUTION_ID_PARAM = {
  name: 'resolutionId',
  description: 'Resolution ID',
  example: '550e8400-e29b-41d4-a716-446655440000',
};

const EVENT_OWNERSHIP_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this event',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Event id not provided', 'Bad Request'),
  customErrorResponse(404, 'Event not found', 'Not found'),
];

const RULE_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this rule',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Rule id not provided', 'Bad Request'),
  customErrorResponse(404, 'Rule not found', 'Not found'),
];

const RESOLUTION_GUARD_EXCEPTIONS = [
  multipleErrorResponses(
    403,
    [
      { summary: 'Not authenticated', message: 'User not authenticated' },
      {
        summary: 'Not owner',
        message: 'You do not have permission to access this resolution',
      },
    ],
    'Forbidden',
  ),
  customErrorResponse(400, 'Resolution id not provided', 'Bad Request'),
  customErrorResponse(404, 'Resolution not found', 'Not found'),
];

export function GetEventListRoute(summary: string) {
  return applyDecorators(
    ApiAuthRoute(summary, {
      queries: [
        ...PAGINATION_QUERIES,
        {
          name: 'isTemplate',
          type: Boolean,
          description: 'Filter events by template status',
          example: true,
          required: false,
        },
        {
          name: 'isPublic',
          type: Boolean,
          description: 'Filter events by public status',
          example: true,
          required: false,
        },
        {
          name: 'eventTypeId',
          type: String,
          description: 'Filter events by event type',
          example: '550e8400-e29b-41d4-a716-446655440000',
          required: false,
        },
      ],
    }),
    ApiPaginatedResponse(EventResponseDto, {
      description: 'Returns the list of events',
    }),
  );
}

export function GetEventDetailsRoute(summary: string) {
  return ApiAuthRoute(summary, {
    params: [EVENT_ID_PARAM],
    responses: [
      {
        status: 200,
        description: 'Returns event with rules and resolutions',
        type: DetailedEventResponseDto,
      },
      customErrorResponse(400, 'Event id not provided', 'Bad Request'),
      customErrorResponse(404, 'Event not found', 'Not found'),
    ],
  });
}

export function CreateEventRoute(summary: string) {
  return ApiAuthRoute(summary, {
    responses: [
      {
        status: 201,
        description: 'Creates and returns the event',
        type: EventResponseDto,
      },
    ],
  });
}

export function UpdateEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Updates and returns the event',
          type: EventResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
      ],
    }),
  );
}

export function DeleteEventRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Deletes and returns the event',
          type: EventResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
      ],
    }),
  );
}

export function GetRuleRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard, RuleGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM, RULE_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Returns the rule',
          type: RuleResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
        ...RULE_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function CreateRuleRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Creates and returns the rule',
          type: RuleResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
      ],
    }),
  );
}

export function UpdateRuleRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard, RuleGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM, RULE_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Updates and returns the rule',
          type: RuleResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
        ...RULE_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function DeleteRuleRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard, RuleGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM, RULE_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Deletes and returns the rule',
          type: RuleResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
        ...RULE_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function GetResolutionRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard, ResolutionGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM, RESOLUTION_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Returns the resolution',
          type: ResolutionResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
        ...RESOLUTION_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function CreateResolutionRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM],
      responses: [
        {
          status: 201,
          description: 'Creates and returns the resolution',
          type: ResolutionResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
      ],
    }),
  );
}

export function UpdateResolutionRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard, ResolutionGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM, RESOLUTION_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Updates and returns the resolution',
          type: ResolutionResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
        ...RESOLUTION_GUARD_EXCEPTIONS,
      ],
    }),
  );
}

export function DeleteResolutionRoute(summary: string) {
  return applyDecorators(
    UseGuards(EventGuard, ResolutionGuard),
    ApiAuthRoute(summary, {
      params: [EVENT_ID_PARAM, RESOLUTION_ID_PARAM],
      responses: [
        {
          status: 200,
          description: 'Deletes and returns the resolution',
          type: ResolutionResponseDto,
        },
        ...EVENT_OWNERSHIP_EXCEPTIONS,
        ...RESOLUTION_GUARD_EXCEPTIONS,
      ],
    }),
  );
}
