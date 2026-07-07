import {
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TwitchService } from './twitch.service';
import type { Request, Response } from 'express';
import { Public } from '../../decorators/public.decorator';

@ApiTags('Twitch')
@Controller('twitch')
export class TwitchController {
  private readonly logger = new Logger(TwitchController.name);

  constructor(private readonly twitchService: TwitchService) {}

  @Post('webhook')
  @Public()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('twitch-eventsub-message-id') messageId: string,
    @Headers('twitch-eventsub-message-timestamp') timestamp: string,
    @Headers('twitch-eventsub-message-signature') signature: string,
    @Headers('twitch-eventsub-message-type') messageType: string,
  ): Promise<void> {
    const rawBody = req.rawBody?.toString() ?? '';

    const result = await this.twitchService.handleWebhook({
      messageId,
      timestamp,
      rawBody,
      signature,
      messageType,
    });

    if (result.challenge) {
      res.status(200).send(result.challenge);
      return;
    }

    res.status(200).send('OK');
  }
}
