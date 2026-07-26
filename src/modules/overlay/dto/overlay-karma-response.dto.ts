import { ApiProperty } from '@nestjs/swagger';

export class OverlayKarmaResponseDto {
  @ApiProperty({
    example: 10,
    description: "Campaign's current karma value",
  })
  karmaValue: number;

  @ApiProperty({
    example: -50,
    description: 'Karma threshold below which chaos events trigger',
  })
  chaosThreshold: number;

  @ApiProperty({
    example: 50,
    description: 'Karma threshold above which blessing events trigger',
  })
  blessingThreshold: number;
}
