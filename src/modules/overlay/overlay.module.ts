import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OverlayController } from './overlay.controller';
import { OverlayService } from './overlay.service';
import { OverlayGuard } from './guard/overlay.guard';
import { OverlayRepository } from './overlay.repository';

@Module({
  imports: [PrismaModule],
  controllers: [OverlayController],
  providers: [OverlayService, OverlayRepository, OverlayGuard],
})
export class OverlayModule {}
