import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CampaignRepository } from './campaign.repository';
import { CampaignEventService } from '../campaign-event/campaign-event.service';
import { CampaignEventRepository } from '../campaign-event/campaign-event.repository';
import { EventRepository } from '../event/event.repository';
import { KarmaEventModule } from '../karma-event/karma-event.module';

@Module({
  imports: [PrismaModule, KarmaEventModule],
  controllers: [CampaignController],
  providers: [
    CampaignService,
    CampaignRepository,
    CampaignEventService,
    CampaignEventRepository,
    EventRepository,
  ],
})
export class CampaignModule {}
