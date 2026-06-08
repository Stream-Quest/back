import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { SessionGateway } from './gateway/session.gateway';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, JwtAuthGuard, SessionGateway],
})
export class SessionModule {}
