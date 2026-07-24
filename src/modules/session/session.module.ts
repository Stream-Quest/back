import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { SessionGateway } from './gateway/session.gateway';
import { AuthModule } from '../../auth/auth.module';
import { SessionEventModule } from '../session-event/session-event.module';
import { SessionStreamerModule } from '../session-streamer/session-streamer.module';
import { KarmaEventModule } from '../karma-event/karma-event.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    KarmaEventModule,
    SessionEventModule,
    SessionStreamerModule,
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, SessionGateway],
})
export class SessionModule {}
