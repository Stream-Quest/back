import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtPayloadInterface } from '../../auth/interface/auth.interface';
import { SocketClientData } from '../interface/session-event.interface';

@WebSocketGateway({ cors: { origin: '*' } })
export class SessionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SessionGateway.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async afterInit() {
    this.logger.log('SessionGateway initialized');
    await this.redisService.psubscribe('session:*', (channel, data) => {
      this.logger.debug(
        `Event Redis recieved [${channel}]: ${JSON.stringify(data)}`,
      );

      const parts = channel.split(':');

      if (parts.length < 3) {
        this.logger.warn(`Invalid channel format: ${channel}`);
        return;
      }

      this.broadcastToSession(parts[1], `session:${parts[2]}`, data);
    });
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    await this.setClientData(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('session:join')
  async handleJoin(client: Socket, sessionId: string) {
    if (!client.data?.userId) {
      this.logger.warn(
        `Connection refused - unauthentified client: ${client.id}`,
      );
      client.disconnect();
      return;
    }

    const session = await this.prismaService.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        campaign: true,
      },
    });

    if (!session) {
      this.logger.warn(`Connection refused - session not found: ${sessionId}`);
      client.emit('session:error', { message: 'Session not found' });
      return;
    }

    if (
      client.data.type === 'gm' &&
      session.campaign.gameMasterId !== client.data.userId
    ) {
      this.logger.warn(`Connection refused - not owner: ${client.data.userId}`);
      client.emit('session:error', { message: 'You do not own this session' });
      return;
    }

    await client.join(`session:${sessionId}`);
    client.emit('session:joined', { sessionId });

    this.logger.log(
      `Client ${client.id} (${client.data.type}) has joined the session:${sessionId}`,
    );
  }

  @SubscribeMessage('session:leave')
  async handleLeave(client: Socket, sessionId: string) {
    await client.leave(`session:${sessionId}`);
    client.emit('session:left', { sessionId });
    this.logger.log(
      `Client ${client.id} (${client.data?.type}) a quitté session:${sessionId}`,
    );
  }

  private broadcastToSession(
    sessionId: string,
    event: string,
    data: unknown,
  ): void {
    this.server.to(`session:${sessionId}`).emit(event, data);
    this.logger.debug(`Broadcast [${event}] → session:${sessionId}`);
  }

  private async setClientData(client: Socket): Promise<void> {
    const token: string = client.handshake.auth.token;
    const overlayToken: string = client.handshake.auth.overlayToken;

    if (!token && !overlayToken) {
      this.logger.warn(`Connection refused - no token given: ${client.id}`);
      client.disconnect();
      return;
    }

    if (overlayToken) {
      const user = await this.prismaService.user.findUnique({
        where: { overlayToken },
      });

      if (!user) {
        this.logger.warn(
          `Connection refused - invalid overlayToken: ${overlayToken}`,
        );
        client.disconnect();
        return;
      }

      client.data = {
        userId: user.id,
        type: 'overlay',
      } satisfies SocketClientData;
      this.logger.log(`Overlay connected: ${client.id} (user: ${user.id})`);
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayloadInterface>(token);

      if (payload.type !== 'ws') {
        this.logger.warn(
          `Connection refused - not a websocket token: ${client.id}`,
        );
        client.disconnect();
        return;
      }

      client.data = {
        userId: payload.sub,
        type: 'gm',
      } satisfies SocketClientData;
      this.logger.log(`GM connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      this.logger.warn(`Connection refused - invalid JWT: ${client.id}`);
      client.disconnect();
    }
  }
}
