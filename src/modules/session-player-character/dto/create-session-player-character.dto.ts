import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateSessionPlayerCharacterDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'PlayerCharacter UUID to add to the session',
  })
  @IsUUID()
  @IsNotEmpty()
  playerCharacterId: string;

  @ApiPropertyOptional({
    example: 55,
    description: 'Starting HP (defaults to PlayerCharacter maxHp if not set)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  currentHp?: number;
}
