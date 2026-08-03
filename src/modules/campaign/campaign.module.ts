import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { CampaignRepository } from './campaign.repository';
import { EventRepository } from '../event/event.repository';
import { KarmaEventModule } from '../karma-event/karma-event.module';
import { CampaignEventModule } from '../campaign-event/campaign-event.module';

@Module({
  imports: [PrismaModule, KarmaEventModule, AuthModule, CampaignEventModule],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository, EventRepository],
})
export class CampaignModule {}
