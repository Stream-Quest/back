import { Injectable, NotFoundException } from '@nestjs/common';
import { Session, SessionPlayerCharacter } from '../../generated/prisma/client';
import { SessionPlayerCharacterRepository } from './session-player-character.repository';
import { CreateSessionPlayerCharacterDto } from './dto/create-session-player-character.dto';
import { UpdateSessionPlayerCharacterDto } from './dto/update-session-player-character.dto';
import {
  DetailedSessionPlayerCharacterResponseDto,
  SessionPlayerCharacterResponseDto,
} from './dto/session-player-character-response.dto';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class SessionPlayerCharacterService {
  constructor(
    private readonly repository: SessionPlayerCharacterRepository,
    private readonly redisService: RedisService,
  ) {}

  async getSessionPlayerCharacterList(
    sessionId: string,
  ): Promise<DetailedSessionPlayerCharacterResponseDto[]> {
    return await this.repository.getSessionPlayerCharacterList(sessionId);
  }

  async createSessionPlayerCharacter(
    dto: CreateSessionPlayerCharacterDto,
    session: Session,
  ): Promise<SessionPlayerCharacterResponseDto> {
    const playerCharacter = await this.repository.getPlayerCharacterWithMaxHp(
      dto.playerCharacterId,
    );

    if (!playerCharacter) {
      throw new NotFoundException('PlayerCharacter not found');
    }

    const currentHp = dto.currentHp ?? playerCharacter.maxHp ?? null;

    return await this.repository.createSessionPlayerCharacter(
      session.id,
      dto.playerCharacterId,
      currentHp,
    );
  }

  async updateSessionPlayerCharacter(
    dto: UpdateSessionPlayerCharacterDto,
    spc: SessionPlayerCharacter,
    session: Session,
  ): Promise<SessionPlayerCharacterResponseDto> {
    const updated = await this.repository.updateSessionPlayerCharacter(
      spc.id,
      dto,
    );

    await this.redisService.publish(`session:${session.id}:player-updated`, {
      sessionPlayerCharacterId: spc.id,
      playerCharacterId: spc.playerCharacterId,
      currentHp: updated.currentHp,
      charStatus: updated.charStatus,
    });

    return updated;
  }

  async removeSessionPlayerCharacter(
    spc: SessionPlayerCharacter,
  ): Promise<SessionPlayerCharacter> {
    return await this.repository.removeSessionPlayerCharacter(spc.id);
  }
}
