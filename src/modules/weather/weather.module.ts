import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherRepository } from './weather.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherRepository],
})
export class WeatherModule {}
