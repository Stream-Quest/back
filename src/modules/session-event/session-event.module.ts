import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { SessionEventController } from './session-event.controller';
import { SessionEventService } from './session-event.service';
import { SessionEventRepository } from './session-event.repository';
import { EventRepository } from '../event/event.repository';
import { KarmaEventModule } from '../karma-event/karma-event.module';
import { SessionGuard } from '../session/guard/session.guard';
import { SessionRepository } from '../session/session.repository';

@Module({
  imports: [PrismaModule, KarmaEventModule, AuthModule],
  controllers: [SessionEventController],
  providers: [
    SessionEventService,
    SessionEventRepository,
    SessionGuard,
    SessionRepository,
    EventRepository,
  ],
  exports: [SessionEventService],
})
export class SessionEventModule {}
