import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TriggerType } from '../../../generated/prisma/enums';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
} from 'class-validator';
import type { JsonValue } from '@prisma/client/runtime/client';

export class CreateRuleDto {
  @ApiProperty({
    enum: TriggerType,
    description: 'Event trigger type',
  })
  @IsEnum(TriggerType)
  @IsNotEmpty()
  triggerType: TriggerType;

  @ApiProperty({
    example: { command: '!wolf', cooldownPerUser: 60 },
    description: 'Trigger configuration (structure depends on triggerType)',
  })
  @IsObject()
  config: JsonValue;

  @ApiPropertyOptional({
    example: 300,
    description: 'Event cooldown',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  cooldown?: number = 300;

  @ApiPropertyOptional({
    example: true,
    description: 'Is the rule active ?',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
