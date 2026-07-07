import { PartialType } from '@nestjs/swagger';
import { CreateTwitchMappingDto } from './create-twitch-mapping.dto';

export class UpdateTwitchMappingDto extends PartialType(
  CreateTwitchMappingDto,
) {}
