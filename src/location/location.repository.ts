import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LocationFindManyArgs,
  LocationOrderByWithRelationInput,
  LocationUpdateInput,
  LocationWhereUniqueInput,
} from '../generated/prisma/models';
import { Location } from '../generated/prisma/client';
import { CreateLocationDto } from './dto/create-location.dto';
import {
  buildPaginationArgs,
  paginatedFindMany,
} from '../helpers/pagination.helper';

@Injectable()
export class LocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLocationList(options?: {
    take?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: LocationOrderByWithRelationInput;
  }): Promise<Location[]> {
    return paginatedFindMany<Location>(
      () =>
        this.prisma.location.findMany(
          buildPaginationArgs<LocationFindManyArgs>(options),
        ),
      options?.direction,
    );
  }

  async getLocation(where: LocationWhereUniqueInput): Promise<Location | null> {
    return await this.prisma.location.findUnique({ where });
  }

  async createLocation(dto: CreateLocationDto): Promise<Location> {
    return await this.prisma.location.create({
      data: {
        name: dto.name.toUpperCase(),
        displayName: dto.displayName,
        description: dto.description,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async updateLocation(
    where: LocationWhereUniqueInput,
    data: LocationUpdateInput,
  ): Promise<Location> {
    return this.prisma.location.update({ where, data });
  }

  async deleteLocation(where: LocationWhereUniqueInput): Promise<Location> {
    return await this.prisma.location.delete({ where });
  }
}
