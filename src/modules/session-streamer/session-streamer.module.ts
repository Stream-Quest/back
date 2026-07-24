// src/modules/session-streamer/session-streamer.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionStreamerController } from './session-streamer.controller';
import { InviteController } from './invite.controller';
import { SessionStreamerService } from './session-streamer.service';
import { SessionStreamerRepository } from './session-streamer.repository';
import { SessionStreamerGuard } from './guard/session-streamer.guard';
import { SessionGuard } from '../session/guard/session.guard';

@Module({
  imports: [PrismaModule],
  controllers: [SessionStreamerController, InviteController],
  providers: [
    SessionStreamerService,
    SessionStreamerRepository,
    SessionStreamerGuard,
    SessionGuard,
  ],
  exports: [SessionStreamerService],
})
export class SessionStreamerModule {}
