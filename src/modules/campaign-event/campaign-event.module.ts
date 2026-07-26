import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { CampaignEventController } from './campaign-event.controller';
import { CampaignEventService } from './campaign-event.service';
import { CampaignEventRepository } from './campaign-event.repository';
import { CampaignEventGuard } from './guard/campaign-event.guard';
import { CampaignGuard } from '../campaign/guard/campaign.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CampaignEventController],
  providers: [
    CampaignEventService,
    CampaignEventRepository,
    CampaignEventGuard,
    CampaignGuard,
  ],
  exports: [CampaignEventService],
})
export class CampaignEventModule {}
