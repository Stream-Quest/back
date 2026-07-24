import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionPlayerCharacterService } from './session-player-character.service';
import {
  DetailedSessionPlayerCharacterResponseDto,
  SessionPlayerCharacterResponseDto,
} from './dto/session-player-character-response.dto';
import { CreateSessionPlayerCharacterDto } from './dto/create-session-player-character.dto';
import { UpdateSessionPlayerCharacterDto } from './dto/update-session-player-character.dto';
import {
  CreateSessionPlayerCharacterRoute,
  GetSessionPlayerCharacterListRoute,
  RemoveSessionPlayerCharacterRoute,
  UpdateSessionPlayerCharacterRoute,
} from './decorator/session-player-character-routes.decorator';
import { SessionPlayerCharacterContext } from './decorator/session-player-character.decorator';
import { SessionContext } from '../session/decorator/session.decorator';
import type {
  Session,
  SessionPlayerCharacter,
} from '../../generated/prisma/client';

@ApiTags('Session Player Character')
@Controller('session')
export class SessionPlayerCharacterController {
  constructor(
    private readonly sessionPlayerCharacterService: SessionPlayerCharacterService,
  ) {}

  @Get(':id/player')
  @GetSessionPlayerCharacterListRoute('Get session player character list')
  async getSessionPlayerCharacterList(
    @SessionContext() session: Session,
  ): Promise<DetailedSessionPlayerCharacterResponseDto[]> {
    return await this.sessionPlayerCharacterService.getSessionPlayerCharacterList(
      session.id,
    );
  }

  @Post(':id/player')
  @CreateSessionPlayerCharacterRoute('Add a player character to the session')
  async createSessionPlayerCharacter(
    @Body() createDto: CreateSessionPlayerCharacterDto,
    @SessionContext() session: Session,
  ): Promise<SessionPlayerCharacterResponseDto> {
    return await this.sessionPlayerCharacterService.createSessionPlayerCharacter(
      createDto,
      session,
    );
  }

  @Patch(':id/player/:spcId')
  @UpdateSessionPlayerCharacterRoute('Update player character HP and status')
  async updateSessionPlayerCharacter(
    @Body() updateDto: UpdateSessionPlayerCharacterDto,
    @SessionPlayerCharacterContext() spc: SessionPlayerCharacter,
    @SessionContext() session: Session,
  ): Promise<SessionPlayerCharacterResponseDto> {
    return await this.sessionPlayerCharacterService.updateSessionPlayerCharacter(
      updateDto,
      spc,
      session,
    );
  }

  @Delete(':id/player/:spcId')
  @RemoveSessionPlayerCharacterRoute(
    'Remove a player character from the session',
  )
  async removeSessionPlayerCharacter(
    @SessionPlayerCharacterContext() spc: SessionPlayerCharacter,
  ): Promise<SessionPlayerCharacter> {
    return await this.sessionPlayerCharacterService.removeSessionPlayerCharacter(
      spc,
    );
  }
}
