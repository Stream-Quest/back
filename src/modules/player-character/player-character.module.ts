import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlayerCharacterController } from './player-character.controller';
import { PlayerCharacterService } from './player-character.service';
import { PlayerCharacterRepository } from './player-character.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PlayerCharacterController],
  providers: [PlayerCharacterService, PlayerCharacterRepository],
})
export class PlayerCharacterModule {}
