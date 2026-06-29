import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ValidateSessionEventDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Resolution UUID chosen by the GM',
  })
  @IsUUID()
  @IsNotEmpty()
  chosenResolutionId: string;

  @ApiPropertyOptional({
    example: 'An ambush of bandits appears from the bush !',
    description:
      'Custom message overriding the resolution message on the OBS overlay',
  })
  @IsString()
  @IsOptional()
  finalMessage?: string;
}
