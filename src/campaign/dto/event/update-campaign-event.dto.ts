import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateCampaignEventDto {
  @ApiProperty({
    example: true,
    description: 'Is this event active for this campaign ?',
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
