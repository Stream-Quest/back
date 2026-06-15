import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  WeatherFindManyArgs,
  WeatherOrderByWithRelationInput,
  WeatherUpdateInput,
  WeatherWhereUniqueInput,
} from '../generated/prisma/models';
import { Weather } from '../generated/prisma/client';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { paginatedFindMany } from '../helpers/pagination.helper';

@Injectable()
export class WeatherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getWeatherList(options?: {
    take?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: WeatherOrderByWithRelationInput;
  }): Promise<Weather[]> {
    return paginatedFindMany<Weather, WeatherFindManyArgs>(
      (args) => this.prisma.weather.findMany(args),
      options,
    );
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
