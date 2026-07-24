import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../../dto/base-query.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class PlayerCharacterQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter player characters by campaign',
  })
  @IsUUID()
  @IsOptional()
  campaignId?: string;
}
