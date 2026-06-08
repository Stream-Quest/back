import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

const _REDIS_FACTORY = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT ?? ''),
  password: process.env.REDIS_PASSWORD,
};

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: () => {
        return new Redis(_REDIS_FACTORY);
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: () => {
        return new Redis(_REDIS_FACTORY);
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
