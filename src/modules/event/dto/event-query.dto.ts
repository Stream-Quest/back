import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../../dto/base-query.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class EventQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Filter by templates',
  })
  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by public status',
  })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    return value === 'true';
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Event Type UUID (foreign key)',
  })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    return value === 'true';
  })
  @IsUUID()
  @IsOptional()
  eventTypeId?: string | null;
}
