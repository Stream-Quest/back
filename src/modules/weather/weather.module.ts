import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherRepository } from './weather.repository';

@Module({
  imports: [PrismaModule],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherRepository],
})
export class WeatherModule {}
