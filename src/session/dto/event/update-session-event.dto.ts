import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateSessionEventDto {
  @ApiPropertyOptional({
    example: 'Embuscade de bandits',
    description:
      'Override the event name displayed to the GM in the veto queue',
  })
  @IsString()
  @IsOptional()
  finalMessage?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'Override the event with a different one (GM replaces wolf ambush with bandit ambush)',
  })
  @IsUUID()
  @IsOptional()
  eventId?: string;
}
