import { ApiProperty } from '@nestjs/swagger';
import { SessionStatus } from '../../../generated/prisma/enums';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateSessionStatusDto {
  @ApiProperty({
    enum: SessionStatus,
    enumName: 'SessionStatus',
    example: SessionStatus.LIVE,
    description: 'Sessions status',
  })
  @IsEnum(SessionStatus)
  @IsNotEmpty()
  status: SessionStatus;
}
