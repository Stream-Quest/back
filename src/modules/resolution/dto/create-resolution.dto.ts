import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateConditionGroupDto } from './condition/create-condition.dto';

export class CreateResolutionDto {
  @ApiPropertyOptional({
    example: 'The wolves emerge from the shadows...',
    description: 'Message displayed when this resolution is chosen',
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is this resolution the fallback when no conditions are met ?',
  })
  @IsBoolean()
  @IsOptional()
  isFallback?: boolean = false;

  @ApiPropertyOptional({
    example: [
      {
        operator: 'AND',
        conditions: [{ contextType: 'TIME_OF_DAY', value: 'NIGHT' }],
      },
    ],
    description:
      'Condition groups that must be satisfied for this resolution to be chosen',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateConditionGroupDto)
  @IsOptional()
  conditionGroups?: CreateConditionGroupDto[];
}
