import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { TriggerType } from '../../../generated/prisma/enums';

export class CreateTwitchMappingDto {
  @ApiProperty({
    enum: TriggerType,
    example: TriggerType.SUB_TIER1,
    description: 'Twitch event type that triggers this mapping',
  })
  @IsEnum(TriggerType)
  @IsNotEmpty()
  twitchEventType: TriggerType;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event UUID to trigger when this Twitch event occurs',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this mapping is active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    example: 5,
    description:
      'Number of Twitch events required before triggering the game event',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  threshold?: number = 1;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to show progress on the OBS overlay',
  })
  @IsBoolean()
  @IsOptional()
  showProgress?: boolean = true;
}
