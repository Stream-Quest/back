import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { LocationRepository } from './location.repository';

@Module({
  imports: [PrismaModule],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository],
})
export class LocationModule {}
