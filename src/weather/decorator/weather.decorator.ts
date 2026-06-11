import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithWeather } from '../../interfaces/authenticated-request.interface';
import { Weather } from '../../generated/prisma/client';

export const WeatherContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Weather => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithWeather>();

    return request.weather;
  },
);
