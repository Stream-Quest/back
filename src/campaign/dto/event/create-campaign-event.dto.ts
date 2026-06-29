import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCampaignEventDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Is this event active for this campaign ?',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event UUID to link to this campaign',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;
}
