import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { KarmaEventController } from './karma-event.controller';
import { KarmaEventService } from './karma-event.service';
import { KarmaEventRepository } from './karma-event.repository';
import { ThresholdEventService } from '../threshold-event/threshold-event.service';
import { ThresholdEventRepository } from '../threshold-event/threshold-event.repository';
import { ThresholdEventGuard } from '../threshold-event/guard/threshold-event.guard';
import { CampaignGuard } from '../campaign/guard/campaign.guard';
import { EventRepository } from '../event/event.repository';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [KarmaEventController],
  providers: [
    KarmaEventService,
    KarmaEventRepository,
    ThresholdEventService,
    ThresholdEventRepository,
    ThresholdEventGuard,
    CampaignGuard,
    EventRepository,
  ],
  exports: [KarmaEventService],
})
export class KarmaEventModule {}
