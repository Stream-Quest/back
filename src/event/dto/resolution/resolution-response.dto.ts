import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConditionGroupResponseDto } from '../condition/condition-response.dto';

export class ResolutionResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Resolution unique identifier',
  })
  id: string;

  @ApiPropertyOptional({
    example: 'The wolves emerge from the shadows...',
    description: 'Message displayed when this resolution is chosen',
  })
  message?: string | null;

  @ApiProperty({
    example: false,
    description: 'Is this resolution the fallback when no conditions are met ?',
  })
  isFallback: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Parent event UUID (foreign key)',
  })
  eventId: string;

  @ApiProperty({
    type: [ConditionGroupResponseDto],
    description:
      'Condition groups that must be satisfied for this resolution to be chosen',
  })
  conditionGroups: ConditionGroupResponseDto[];

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}
