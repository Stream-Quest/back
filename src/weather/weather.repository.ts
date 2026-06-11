import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  WeatherOrderByWithRelationInput,
  WeatherUpdateInput,
  WeatherWhereUniqueInput,
} from '../generated/prisma/models';
import { Weather } from '../generated/prisma/client';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Injectable()
export class WeatherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getWeatherList(options?: {
    take?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: WeatherOrderByWithRelationInput;
  }): Promise<Weather[]> {
    const isBackward = options?.direction === 'backward';
    const take = options?.take || 10;

    const result = await this.prisma.weather.findMany({
      take: isBackward ? -take : take,
      ...(options?.cursor && {
        skip: 1,
        cursor: { id: options.cursor },
      }),
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });

    return isBackward ? result.reverse() : result;
  }

  async getWeather(where: WeatherWhereUniqueInput): Promise<Weather | null> {
    return await this.prisma.weather.findUnique({
      where,
    });
  }

  async createWeather(dto: CreateWeatherDto): Promise<Weather> {
    return await this.prisma.weather.create({
      data: {
        name: dto.name.toUpperCase(),
        displayName: dto.displayName,
        description: dto.description,
        iconUrl: dto.iconUrl,
      },
    });
  }

  async updateWeather(
    where: WeatherWhereUniqueInput,
    data: WeatherUpdateInput,
  ): Promise<Weather> {
    return await this.prisma.weather.update({
      where,
      data,
    });
  }

  async deleteWeather(where: WeatherWhereUniqueInput): Promise<Weather> {
    return await this.prisma.weather.delete({ where });
  }
}
