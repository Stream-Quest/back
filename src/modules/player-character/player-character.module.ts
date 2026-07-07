import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { PlayerCharacterController } from './player-character.controller';
import { PlayerCharacterService } from './player-character.service';
import { PlayerCharacterRepository } from './player-character.repository';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlayerCharacterController],
  providers: [PlayerCharacterService, PlayerCharacterRepository, JwtAuthGuard],
})
export class PlayerCharacterModule {}
