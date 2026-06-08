import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

const createMockRedisClient = () => ({
  publish: jest.fn(),
  psubscribe: jest.fn(),
  on: jest.fn(),
});

describe('RedisService', () => {
  let service: RedisService;

  const mockPublisher = createMockRedisClient();
  const mockSubscriber = createMockRedisClient();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_PUBLISHER',
          useValue: mockPublisher,
        },
        {
          provide: 'REDIS_SUBSCRIBER',
          useValue: mockSubscriber,
        },
      ],
    }).compile();

    service = module.get(RedisService);

    jest.clearAllMocks();
  });

  describe('publish', () => {
    it('should publish a serialized JSON message to the given channel', async () => {
      mockPublisher.publish.mockResolvedValue(1);

      const channel = 'session:123:started';
      const data = { sessionId: '123', startedAt: new Date().toISOString() };

      await service.publish(channel, data);

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        channel,
        JSON.stringify(data),
      );
    });

    it('should publish once per call', async () => {
      mockPublisher.publish.mockResolvedValue(1);

      await service.publish('session:123:started', { sessionId: '123' });
      await service.publish('session:123:ended', { sessionId: '123' });

      expect(mockPublisher.publish).toHaveBeenCalledTimes(2);
    });

    it('should serialize complex objects correctly', async () => {
      mockPublisher.publish.mockResolvedValue(1);

      const data = {
        sessionId: '123',
        startedAt: '2026-06-08T21:40:12.174Z',
        nested: { timeOfDay: 'DAWN' },
      };

      await service.publish('session:123:context-updated', data);

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        'session:123:context-updated',
        JSON.stringify(data),
      );
    });
  });

  describe('psubscribe', () => {
    it('should subscribe to the given pattern', async () => {
      mockSubscriber.psubscribe.mockResolvedValue(1);
      mockSubscriber.on.mockImplementation(() => {});

      await service.psubscribe('session:*', jest.fn());

      expect(mockSubscriber.psubscribe).toHaveBeenCalledWith('session:*');
    });

    it('should register a pmessage listener', async () => {
      mockSubscriber.psubscribe.mockResolvedValue(1);
      mockSubscriber.on.mockImplementation(() => {});

      await service.psubscribe('session:*', jest.fn());

      expect(mockSubscriber.on).toHaveBeenCalledWith(
        'pmessage',
        expect.any(Function),
      );
    });

    it('should call the callback with channel and parsed data when a message is received', async () => {
      mockSubscriber.psubscribe.mockResolvedValue(1);

      let capturedListener: (
        pattern: string,
        channel: string,
        message: string,
      ) => void = () => {};

      mockSubscriber.on.mockImplementation((event, listener) => {
        if (event === 'pmessage') {
          capturedListener = listener;
        }
      });

      const callback = jest.fn();
      await service.psubscribe('session:*', callback);

      const data = { sessionId: '123', startedAt: '2026-06-08T21:40:12.174Z' };
      capturedListener(
        'session:*',
        'session:123:started',
        JSON.stringify(data),
      );

      expect(callback).toHaveBeenCalledWith('session:123:started', data);
    });

    it('should not call the callback before a message is received', async () => {
      mockSubscriber.psubscribe.mockResolvedValue(1);
      mockSubscriber.on.mockImplementation(() => {});

      const callback = jest.fn();
      await service.psubscribe('session:*', callback);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
