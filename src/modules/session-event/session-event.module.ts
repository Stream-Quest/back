import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionEventController } from './session-event.controller';
import { SessionEventService } from './session-event.service';
import { SessionEventRepository } from './session-event.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SessionEventController],
  providers: [SessionEventService, SessionEventRepository],
})
export class SessionEventModule {}
