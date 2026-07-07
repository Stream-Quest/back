import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResolutionResponseDto } from './dto/resolution-response.dto';
import { CreateResolutionDto } from './dto/create-resolution.dto';
import { UpdateResolutionDto } from './dto/update-resolution.dto';
import { Resolution } from '../../generated/prisma/client';
import { ResolutionRepository } from './resolution.repository';

@Injectable()
export class ResolutionService {
  constructor(private readonly repository: ResolutionRepository) {}

  async getResolution(id: string): Promise<ResolutionResponseDto> {
    if (!id) {
      throw new BadRequestException('Resolution id is missing');
    }

    const resolution = await this.repository.getResolution({ id });

    if (!resolution) {
      throw new NotFoundException('Resolution not found');
    }

    return resolution;
  }

  async createResolution(
    dto: CreateResolutionDto,
    eventId: string,
  ): Promise<ResolutionResponseDto> {
    return this.repository.createResolution(dto, eventId);
  }

  async updateResolution(
    dto: UpdateResolutionDto,
    resolution: Resolution,
  ): Promise<ResolutionResponseDto> {
    return this.repository.updateResolution({ id: resolution.id }, dto);
  }

  async deleteResolution(resolution: Resolution): Promise<Resolution> {
    return this.repository.deleteResolution({ id: resolution.id });
  }
}
