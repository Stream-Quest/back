import { Module } from '@nestjs/common';
import { TwitchMappingController } from './twitch-mapping.controller';
import { TwitchMappingService } from './twitch-mapping.service';
import { TwitchMappingRepository } from './twitch-mapping.repository';
import { TwitchMappingGuard } from './guard/twitch-mapping.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CampaignGuard } from '../campaign/guard/campaign.guard';
import { EventRepository } from '../event/event.repository';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [PrismaModule, AuthModule, RedisModule],
  controllers: [TwitchMappingController],
  providers: [
    TwitchMappingService,
    TwitchMappingRepository,
    TwitchMappingGuard,
    JwtAuthGuard,
    CampaignGuard,
    EventRepository,
  ],
  exports: [TwitchMappingRepository],
})
export class TwitchMappingModule {}
