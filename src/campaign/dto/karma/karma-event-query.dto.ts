import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { BaseQueryDto } from '../../../dto/base-query.dto';

export class KarmaEventQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter karma events by session',
  })
  @IsUUID()
  @IsOptional()
  sessionId?: string;
}
