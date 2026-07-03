import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { KarmaEventController } from './karma-event.controller';
import { KarmaEventService } from './karma-event.service';
import { KarmaEventRepository } from './karma-event.repository';
import { ThresholdEventService } from './threshold-event.service';
import { ThresholdEventRepository } from './threshold-event.repository';
import { ThresholdEventGuard } from './guard/threshold-event.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CampaignGuard } from '../campaign/guard/campaign.guard';
import { EventRepository } from '../event/event.repository';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, AuthModule, RedisModule],
  controllers: [KarmaEventController],
  providers: [
    KarmaEventService,
    KarmaEventRepository,
    ThresholdEventService,
    ThresholdEventRepository,
    ThresholdEventGuard,
    JwtAuthGuard,
    CampaignGuard,
    EventRepository,
  ],
  exports: [KarmaEventService],
})
export class KarmaEventModule {}
