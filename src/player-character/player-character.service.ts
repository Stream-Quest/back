import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlayerCharacterRepository } from './player-character.repository';
import { PlayerCharacterQueryDto } from './dto/player-character-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { paginate } from '../helpers/pagination.helper';
import { PlayerCharacterResponseDto } from './dto/player-character-response.dto';
import { PlayerCharacter } from '../generated/prisma/client';
import { UpdatePlayerCharacterDto } from './dto/update-player-character.dto';
import { CreatePlayerCharacterDto } from './dto/create-player-character.dto';

@Injectable()
export class PlayerCharacterService {
  constructor(private readonly repository: PlayerCharacterRepository) {}

  async getPlayerCharacterList(
    queryDto: PlayerCharacterQueryDto,
  ): Promise<PaginationResponseDto<PlayerCharacterResponseDto>> {
    const playerCharacters = await this.repository.getPlayerCharacterList({
      take: (queryDto.limit || 10) + 1,
      cursor: queryDto.cursor,
      direction: queryDto.direction,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(playerCharacters, queryDto);
  }

  async getPlayerCharacter(id: string): Promise<PlayerCharacterResponseDto> {
    if (!id) {
      throw new BadRequestException('PlayerCharacter id is missing');
    }

    const playerCharacter = await this.repository.getPlayerCharacter({ id });

    if (!playerCharacter) {
      throw new NotFoundException('PlayerCharacter not found');
    }

    return playerCharacter;
  }

  async createPlayerCharacter(
    dto: CreatePlayerCharacterDto,
  ): Promise<PlayerCharacterResponseDto> {
    return await this.repository.createPlayerCharacter(dto);
  }

  async updatePlayerCharacter(
    dto: UpdatePlayerCharacterDto,
    playerCharacter: PlayerCharacter,
  ): Promise<PlayerCharacterResponseDto> {
    return await this.repository.updatePlayerCharacter(
      { id: playerCharacter.id },
      dto,
    );
  }

  async deletePlayerCharacter(
    playerCharacter: PlayerCharacter,
  ): Promise<PlayerCharacter> {
    return await this.repository.deletePlayerCharacter({
      id: playerCharacter.id,
    });
  }
}
