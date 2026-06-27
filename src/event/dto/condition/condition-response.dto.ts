import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContextType, Operator } from '../../../generated/prisma/enums';

export class ConditionResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Condition unique identifier',
  })
  id: string;

  @ApiProperty({
    enum: ContextType,
    example: 'TIME_OF_DAY',
    description: 'Context type to evaluate',
  })
  contextType: ContextType;

  @ApiProperty({
    example: 'NIGHT',
    description: 'Expected value for the context type',
  })
  value: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Parent condition group UUID (foreign key)',
  })
  conditionGroupId: string;

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

export class ConditionGroupResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Condition group unique identifier',
  })
  id: string;

  @ApiProperty({
    enum: Operator,
    example: 'AND',
    description: 'Logical operator applied between conditions',
  })
  operator: Operator;

  @ApiProperty({
    type: [ConditionResponseDto],
    description: 'Conditions in this group',
  })
  conditions: ConditionResponseDto[];

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Parent resolution UUID (foreign key)',
  })
  resolutionId?: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Parent condition group UUID for nested groups (foreign key)',
  })
  parentGroupId?: string | null;

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
