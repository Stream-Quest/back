import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LocationRepository } from './location.repository';
import { LocationQueryDto } from './dto/location-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { LocationResponseDto } from './dto/location-response.dto';
import { paginate } from '../helpers/pagination.helper';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from '../generated/prisma/client';

@Injectable()
export class LocationService {
  constructor(private readonly repository: LocationRepository) {}

  async getLocationList(
    queryDto: LocationQueryDto,
  ): Promise<PaginationResponseDto<LocationResponseDto>> {
    const locations = await this.repository.getLocationList({
      take: (queryDto.limit || 10) + 1,
      cursor: queryDto.cursor,
      direction: queryDto.direction,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(locations, queryDto);
  }

  async getLocation(id: string): Promise<LocationResponseDto> {
    if (!id) {
      throw new BadRequestException('Location id is missing');
    }

    const location = await this.repository.getLocation({ id });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async createLocation(dto: CreateLocationDto): Promise<LocationResponseDto> {
    return await this.repository.createLocation(dto);
  }

  async updateLocation(
    dto: UpdateLocationDto,
    location: Location,
  ): Promise<LocationResponseDto> {
    return await this.repository.updateLocation({ id: location.id }, dto);
  }

  async deleteLocation(location: Location): Promise<Location> {
    return await this.repository.deleteLocation({ id: location.id });
  }
}
