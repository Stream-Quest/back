import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { LocationRepository } from './location.repository';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository, JwtAuthGuard],
})
export class LocationModule {}
