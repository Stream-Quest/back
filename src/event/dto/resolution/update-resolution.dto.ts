import { PartialType } from '@nestjs/swagger';
import { CreateResolutionDto } from './create-resolution.dto';

export class UpdateResolutionDto extends PartialType(CreateResolutionDto) {}
