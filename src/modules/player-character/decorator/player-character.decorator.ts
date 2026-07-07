import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithPlayerCharacter } from '../../../interfaces/authenticated-request.interface';
import { PlayerCharacter } from '../../../generated/prisma/client';

export const PlayerCharacterContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PlayerCharacter => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithPlayerCharacter>();

    return request.playerCharacter;
  },
);
