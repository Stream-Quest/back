import { ApiProperty } from '@nestjs/swagger';
import { ContextType, Operator } from '../../../generated/prisma/enums';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConditionDto {
  @ApiProperty({
    example: 'TIME_OF_DAY',
    enum: ContextType,
    description: 'Context type to evaluate',
  })
  @IsEnum(ContextType)
  contextType: ContextType;

  @ApiProperty({
    example: 'NIGHT',
    description: 'Expected value for the context type',
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateConditionGroupDto {
  @ApiProperty({
    example: 'AND',
    enum: Operator,
    description: 'Logical operator between conditions',
  })
  @IsEnum(Operator)
  operator: Operator;

  @ApiProperty({
    example: [{ contextType: 'TIME_OF_DAY', value: 'NIGHT' }],
    description: 'Conditions in this group',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateConditionDto)
  conditions: CreateConditionDto[];
}
