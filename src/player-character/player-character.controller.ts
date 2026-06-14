import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PlayerCharacterService } from './player-character.service';
import { PlayerCharacterQueryDto } from './dto/player-character-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { PlayerCharacterResponseDto } from './dto/player-character-response.dto';
import { CreatePlayerCharacterDto } from './dto/create-player-character.dto';
import { UpdatePlayerCharacterDto } from './dto/update-player-character.dto';
import type { PlayerCharacter } from '../generated/prisma/client';
import { PlayerCharacterContext } from './decorator/player-character.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  CreatePlayerCharacterRoute,
  DeletePlayerCharacterRoute,
  GetPlayerCharacterDetailsRoute,
  GetPlayerCharacterListRoute,
  UpdatePlayerCharacterRoute,
} from './decorator/player-character-routes.decorator';

@ApiTags('Player Character')
@Controller('player-character')
export class PlayerCharacterController {
  constructor(
    private readonly playerCharacterService: PlayerCharacterService,
  ) {}

  @Get('')
  @GetPlayerCharacterListRoute('Get player characters')
  async playerCharacterList(
    @Query() filterDto: PlayerCharacterQueryDto,
  ): Promise<PaginationResponseDto<PlayerCharacterResponseDto>> {
    return await this.playerCharacterService.getPlayerCharacterList(filterDto);
  }

  @Get(':id')
  @GetPlayerCharacterDetailsRoute("Get a player character's details")
  async playerCharacterDetails(
    @Param('id') playerCharacterId: string,
  ): Promise<PlayerCharacterResponseDto> {
    return await this.playerCharacterService.getPlayerCharacter(
      playerCharacterId,
    );
  }

  @Post('')
  @CreatePlayerCharacterRoute('Create a player character')
  async createPlayerCharacter(
    @Body() createDto: CreatePlayerCharacterDto,
  ): Promise<PlayerCharacterResponseDto> {
    return await this.playerCharacterService.createPlayerCharacter(createDto);
  }

  @Patch(':id')
  @UpdatePlayerCharacterRoute('Update a player character')
  async updatePlayerCharacter(
    @Body() updateDto: UpdatePlayerCharacterDto,
    @PlayerCharacterContext() playerCharacter: PlayerCharacter,
  ): Promise<PlayerCharacterResponseDto> {
    return await this.playerCharacterService.updatePlayerCharacter(
      updateDto,
      playerCharacter,
    );
  }

  @Delete(':id')
  @DeletePlayerCharacterRoute('Delete a player character')
  async deletePlayerCharacter(
    @PlayerCharacterContext() playerCharacter: PlayerCharacter,
  ): Promise<PlayerCharacterResponseDto> {
    return await this.playerCharacterService.deletePlayerCharacter(
      playerCharacter,
    );
  }
}
