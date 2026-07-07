import { ApiProperty } from '@nestjs/swagger';
import { TriggerType } from '../../../generated/prisma/enums';
import type { JsonValue } from '@prisma/client/runtime/client';

export class RuleResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Rule unique identifier',
  })
  id: string;

  @ApiProperty({
    enum: TriggerType,
    example: 'CHAT_COMMAND',
    description: 'Type of Twitch trigger that activates this rule',
  })
  triggerType: TriggerType;

  @ApiProperty({
    example: { command: '!wolf', cooldownPerUser: 60 },
    description: 'Trigger configuration (structure depends on triggerType)',
  })
  config: JsonValue;

  @ApiProperty({
    example: 300,
    description: 'Cooldown in seconds between two triggers',
  })
  cooldown: number;

  @ApiProperty({
    example: true,
    description: 'Is this rule active ?',
  })
  isActive: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Parent event UUID (foreign key)',
  })
  eventId: string;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}
