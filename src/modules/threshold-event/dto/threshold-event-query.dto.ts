import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '../../../dto/base-query.dto';
import { ThresholdType } from '../../../generated/prisma/enums';

export class ThresholdEventQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    enum: ThresholdType,
    example: ThresholdType.CHAOS,
    description: 'Filter by threshold type',
  })
  @IsEnum(ThresholdType)
  @IsOptional()
  thresholdType?: ThresholdType;
}
