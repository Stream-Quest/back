import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';
import type { Weather } from '../generated/prisma/client';
import { WeatherContext } from './decorator/weather.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateWeatherRoute,
  DeleteWeatherRoute,
  GetWeatherDetailsRoute,
  GetWeatherListRoute,
  UpdateWeatherRoute,
} from './decorator/weather-routes.decorator';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('')
  @GetWeatherListRoute('Get weathers')
  async weatherList(
    @Query() filterDto: WeatherQueryDto,
  ): Promise<PaginationResponseDto<WeatherResponseDto>> {
    return await this.weatherService.getWeatherList(filterDto);
  }

  @Get(':id')
  @GetWeatherDetailsRoute("Get a weather's details")
  async weatherDetails(
    @Param('id') weatherId: string,
  ): Promise<WeatherResponseDto> {
    return await this.weatherService.getWeather(weatherId);
  }

  @Post('')
  @CreateWeatherRoute('Create a weather')
  async createWeather(
    @Body() createDto: CreateWeatherDto,
  ): Promise<WeatherResponseDto> {
    return await this.weatherService.createWeather(createDto);
  }

  @Patch(':id')
  @UpdateWeatherRoute('Update a weather')
  async updateWeather(
    @Body() updateDto: UpdateWeatherDto,
    @WeatherContext() weather: Weather,
  ): Promise<WeatherResponseDto> {
    return await this.weatherService.updateWeather(updateDto, weather);
  }

  @Delete(':id')
  @DeleteWeatherRoute('Delete a weather')
  async deleteWeather(
    @WeatherContext() weather: Weather,
  ): Promise<WeatherResponseDto> {
    return await this.weatherService.deleteWeather(weather);
  }
}
