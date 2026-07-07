import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '../../dto/base-query.dto';
import { TriggerType } from '../../generated/prisma/enums';
import { Transform } from 'class-transformer';

export class TwitchMappingQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    enum: TriggerType,
    example: TriggerType.SUB_TIER1,
    description: 'Filter by Twitch event type',
  })
  @IsEnum(TriggerType)
  @IsOptional()
  twitchEventType?: TriggerType;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @Transform(
    ({ value }: { value: unknown }) => value === 'true' || value === true,
  )
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
