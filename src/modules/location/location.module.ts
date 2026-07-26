import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { LocationRepository } from './location.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository],
})
export class LocationModule {}
