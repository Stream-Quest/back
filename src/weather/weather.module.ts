import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherRepository } from './weather.repository';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherRepository, JwtAuthGuard],
})
export class WeatherModule {}
