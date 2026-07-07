import { PartialType } from '@nestjs/swagger';
import { CreatePlayerCharacterDto } from './create-player-character.dto';

export class UpdatePlayerCharacterDto extends PartialType(
  CreatePlayerCharacterDto,
) {}
