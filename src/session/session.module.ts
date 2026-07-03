import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { SessionGateway } from './gateway/session.gateway';
import { SessionEventService } from './session-event.service';
import { SessionEventRepository } from './session-event.repository';
import { SessionEventGuard } from './guard/session-event.guard';
import { EventRepository } from '../event/event.repository';
import { KarmaEventModule } from '../campaign/karma-event.module';

@Module({
  imports: [PrismaModule, KarmaEventModule, AuthModule],
  controllers: [SessionController],
  providers: [
    SessionService,
    SessionRepository,
    SessionEventService,
    SessionEventRepository,
    SessionEventGuard,
    EventRepository,
    JwtAuthGuard,
    SessionGateway,
  ],
})
export class SessionModule {}
