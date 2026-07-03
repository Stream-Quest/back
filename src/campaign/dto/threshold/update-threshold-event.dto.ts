import { PartialType } from '@nestjs/swagger';
import { CreateThresholdEventDto } from './create-threshold-event.dto';

export class UpdateThresholdEventDto extends PartialType(
  CreateThresholdEventDto,
) {}
