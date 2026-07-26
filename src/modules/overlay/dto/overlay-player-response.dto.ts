import { ApiProperty } from '@nestjs/swagger';
import { SessionPlayerCharacterResponseDto } from '../../session-player-character/dto/session-player-character-response.dto';
import { PlayerCharacterResponseDto } from '../../player-character/dto/player-character-response.dto';

export class OverlayPlayerResponseDto extends SessionPlayerCharacterResponseDto {
  @ApiProperty({
    type: () => PlayerCharacterResponseDto,
    description: 'Full player character details',
  })
  playerCharacter: PlayerCharacterResponseDto;
}
