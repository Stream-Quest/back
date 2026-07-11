import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateSessionStreamerDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Can view events overlay ?',
  })
  @IsBoolean()
  @IsOptional()
  canViewEvents?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Can view karma overlay ?',
  })
  @IsBoolean()
  @IsOptional()
  canViewKarma?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Can view milestones overlay ?',
  })
  @IsBoolean()
  @IsOptional()
  canViewMilestones?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Can view context overlay ?',
  })
  @IsBoolean()
  @IsOptional()
  canViewContext?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Can view players overlay ?',
  })
  @IsBoolean()
  @IsOptional()
  canViewPlayers?: boolean;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Assign a PlayerCharacter to this streamer (null to unassign)',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  playerCharacterId?: string | null;
}
