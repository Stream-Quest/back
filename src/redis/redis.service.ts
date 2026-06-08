import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_PUBLISHER') private readonly publisher: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly subscriber: Redis,
  ) {}

  async publish(channel: string, data: unknown): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(data));
  }

  async psubscribe(
    pattern: string,
    callback: (channel: string, data: unknown) => void,
  ): Promise<void> {
    await this.subscriber.psubscribe(pattern);
    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      callback(channel, JSON.parse(message));
    });
  }
}
