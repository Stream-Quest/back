import { Test, TestingModule } from '@nestjs/testing';
import { TwitchController } from '../twitch.controller';
import { TwitchService } from '../twitch.service';

describe('TwitchController', () => {
  let controller: TwitchController;
  let service: TwitchService;

  const mockService = {
    handleWebhook: jest.fn(),
  };

  const createMockReqRes = (rawBody: string) => {
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const req = {
      rawBody: Buffer.from(rawBody),
    };
    return { req, res };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwitchController],
      providers: [{ provide: TwitchService, useValue: mockService }],
    }).compile();

    controller = module.get(TwitchController);
    service = module.get(TwitchService);

    jest.clearAllMocks();
  });

  describe('handleWebhook', () => {
    it('should send challenge when service returns one', async () => {
      const { req, res } = createMockReqRes('{"challenge":"abc123"}');
      jest
        .spyOn(service, 'handleWebhook')
        .mockResolvedValue({ challenge: 'abc123' });

      await controller.handleWebhook(
        req as any,
        res as any,
        'msg-123',
        '2024-01-01',
        'sha256=abc',
        'webhook_callback_verification',
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('abc123');
    });

    it('should send OK when no challenge', async () => {
      const { req, res } = createMockReqRes('{"subscription":{},"event":{}}');
      jest.spyOn(service, 'handleWebhook').mockResolvedValue({});

      await controller.handleWebhook(
        req as any,
        res as any,
        'msg-123',
        '2024-01-01',
        'sha256=abc',
        'notification',
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('OK');
    });

    it('should pass correct params to service', async () => {
      const rawBody = '{"subscription":{},"event":{}}';
      const { req, res } = createMockReqRes(rawBody);
      jest.spyOn(service, 'handleWebhook').mockResolvedValue({});

      await controller.handleWebhook(
        req as any,
        res as any,
        'msg-123',
        '2024-01-01',
        'sha256=abc',
        'notification',
      );

      expect(service.handleWebhook).toHaveBeenCalledWith({
        messageId: 'msg-123',
        timestamp: '2024-01-01',
        rawBody,
        signature: 'sha256=abc',
        messageType: 'notification',
      });
    });
  });
});
