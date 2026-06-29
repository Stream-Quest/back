import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from '../../../dto/base-query.dto';

export class CampaignEventQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    return value === 'true';
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
