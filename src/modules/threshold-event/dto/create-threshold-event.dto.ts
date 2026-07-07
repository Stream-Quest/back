import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ThresholdType } from '../../../generated/prisma/enums';

export class CreateThresholdEventDto {
  @ApiProperty({
    enum: ThresholdType,
    example: ThresholdType.CHAOS,
    description: 'Which threshold triggers this event (CHAOS or BLESSING)',
  })
  @IsEnum(ThresholdType)
  @IsNotEmpty()
  thresholdType: ThresholdType;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event UUID to trigger when threshold is reached',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;
}
