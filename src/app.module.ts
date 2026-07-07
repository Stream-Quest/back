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
import { EventModule } from './event/event.module';
import { KarmaEventModule } from './campaign/karma-event.module';
import { TwitchModule } from './twitch/twitch.module';
import { TwitchMappingModule } from './twitch-mapping/twitch-mapping.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
