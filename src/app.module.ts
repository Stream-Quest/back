import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './campaign/campaign.module';
import { SessionModule } from './session/session.module';
import { RedisModule } from './redis/redis.module';
import { WeatherModule } from './weather/weather.module';
import { LocationModule } from './location/location.module';
import { PlayerCharacterModule } from './player-character/player-character.module';
import { EventTypeModule } from './event-type/event-type.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CampaignModule,
    SessionModule,
    RedisModule,
    WeatherModule,
    LocationModule,
    PlayerCharacterModule,
    EventTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
