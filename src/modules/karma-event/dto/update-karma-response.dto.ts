import { ApiProperty } from '@nestjs/swagger';
import { KarmaEventResponseDto } from './karma-event-response.dto';

export class UpdateKarmaResponseDto {
  @ApiProperty({
    example: -310,
    description: 'New campaign karma value after this event was applied',
  })
  newKarmaValue: number;

  @ApiProperty({
    type: KarmaEventResponseDto,
    description: 'The karma event that was created',
  })
  karmaEvent: KarmaEventResponseDto;
}
