import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LocationOrderByWithRelationInput,
  LocationUpdateInput,
  LocationWhereUniqueInput,
} from '../generated/prisma/models';
import { Location } from '../generated/prisma/client';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLocationList(options?: {
    take?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: LocationOrderByWithRelationInput;
  }): Promise<Location[]> {
    const isBackward = options?.direction === 'backward';
    const take = options?.take || 10;

    const result = await this.prisma.location.findMany({
      take: isBackward ? -take : take,
      ...(options?.cursor && {
        skip: 1,
        cursor: { id: options.cursor },
      }),
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });

    return isBackward ? result.reverse() : result;
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
