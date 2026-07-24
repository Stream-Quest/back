import { ApiProperty } from '@nestjs/swagger';

class OverlayLinkDto {
  @ApiProperty({ example: 'milestones' })
  type: string;

  @ApiProperty({
    example: 'https://app.com/overlay/session-123/milestones?token=xxx',
  })
  url: string;

  @ApiProperty({ example: true })
  enabled: boolean;
}

export class OverlayLinkResponseDto {
  @ApiProperty({ type: [OverlayLinkDto] })
  overlays: OverlayLinkDto[];
}
