import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CharacterStatus } from '../../../generated/prisma/enums';

export class UpdateSessionPlayerCharacterDto {
  @ApiPropertyOptional({
    example: 32,
    description: 'Current HP of the character',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  currentHp?: number;

  @ApiPropertyOptional({
    enum: CharacterStatus,
    example: CharacterStatus.HURT,
    description: 'Current character status',
  })
  @IsEnum(CharacterStatus)
  @IsOptional()
  charStatus?: CharacterStatus;
}
