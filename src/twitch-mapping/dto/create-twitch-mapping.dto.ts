import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { TriggerType } from '../../generated/prisma/enums';

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
}
