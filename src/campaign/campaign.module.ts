import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CampaignRepository } from './campaign.repository';
import { CampaignEventService } from './campaign-event.service';
import { CampaignEventRepository } from './campaign-event.repository';
import { EventRepository } from '../event/event.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CampaignController],
  providers: [
    CampaignService,
    CampaignRepository,
    CampaignEventService,
    CampaignEventRepository,
    EventRepository,
    JwtAuthGuard,
  ],
})
export class CampaignModule {}
