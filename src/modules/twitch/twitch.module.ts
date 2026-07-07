import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { TwitchMappingModule } from '../twitch-mapping/twitch-mapping.module';

@Module({
  imports: [PrismaModule, RedisModule, TwitchMappingModule],
  controllers: [TwitchController],
  providers: [TwitchService],
  exports: [TwitchService],
})
export class TwitchModule {}
