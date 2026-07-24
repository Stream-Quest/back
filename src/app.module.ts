import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { SessionModule } from './modules/session/session.module';
import { RedisModule } from './redis/redis.module';
import { WeatherModule } from './modules/weather/weather.module';
import { LocationModule } from './modules/location/location.module';
import { PlayerCharacterModule } from './modules/player-character/player-character.module';
import { EventTypeModule } from './modules/event-type/event-type.module';
import { EventModule } from './modules/event/event.module';
import { KarmaEventModule } from './modules/karma-event/karma-event.module';
import { TwitchModule } from './modules/twitch/twitch.module';
import { TwitchMappingModule } from './modules/twitch-mapping/twitch-mapping.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { OverlayModule } from './modules/overlay/overlay.module';

const required = Joi.string().required();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        TWITCH_CLIENT_ID: required,
        TWITCH_CLIENT_SECRET: required,
        TWITCH_WEBHOOK_SECRET: required,
        TWITCH_WEBHOOK_CALLBACK_URL: required,
        REDIS_HOST: required,
        REDIS_PORT: required,
        REDIS_PASSWORD: required,
        OVERLAY_BASE_URL: required,
      }),
    }),
    PrismaModule,
    AuthModule,
    CampaignModule,
    SessionModule,
    RedisModule,
    WeatherModule,
    LocationModule,
    PlayerCharacterModule,
    EventTypeModule,
    EventModule,
    KarmaEventModule,
    TwitchModule,
    TwitchMappingModule,
    OverlayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
