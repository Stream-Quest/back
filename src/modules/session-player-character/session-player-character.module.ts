import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionPlayerCharacterController } from './session-player-character.controller';
import { SessionPlayerCharacterService } from './session-player-character.service';
import { SessionPlayerCharacterRepository } from './session-player-character.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SessionPlayerCharacterController],
  providers: [SessionPlayerCharacterService, SessionPlayerCharacterRepository],
})
export class SessionPlayerCharacterModule {}
