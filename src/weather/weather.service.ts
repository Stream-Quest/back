import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WeatherRepository } from './weather.repository';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { paginate } from '../helpers/pagination.helper';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';
import { Weather } from '../generated/prisma/client';

@Injectable()
export class WeatherService {
  constructor(private readonly repository: WeatherRepository) {}

  async getWeatherList(
    queryDto: WeatherQueryDto,
  ): Promise<PaginationResponseDto<WeatherResponseDto>> {
    const weathers = await this.repository.getWeatherList({
      take: (queryDto.limit || 10) + 1,
      cursor: queryDto.cursor,
      direction: queryDto.direction,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(weathers, queryDto);
  }

  async getWeather(id: string): Promise<WeatherResponseDto> {
    if (!id) {
      throw new BadRequestException('Weather id is missing');
    }

    const weather = await this.repository.getWeather({ id });

    if (!weather) {
      throw new NotFoundException('Weather not found');
    }

    return weather;
  }

  async createWeather(dto: CreateWeatherDto): Promise<WeatherResponseDto> {
    return await this.repository.createWeather(dto);
  }

  async updateWeather(
    dto: UpdateWeatherDto,
    weather: Weather,
  ): Promise<WeatherResponseDto> {
    return await this.repository.updateWeather({ id: weather.id }, dto);
  }

  async deleteWeather(weather: Weather): Promise<Weather> {
    return await this.repository.deleteWeather({ id: weather.id });
  }
}
