import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '../../../dto/base-query.dto';
import { SessionEventStatus } from '../../../generated/prisma/enums';

export class SessionEventQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    enum: SessionEventStatus,
    example: SessionEventStatus.PENDING,
    description: 'Filter session events by status',
  })
  @IsEnum(SessionEventStatus)
  @IsOptional()
  status?: SessionEventStatus;
}
