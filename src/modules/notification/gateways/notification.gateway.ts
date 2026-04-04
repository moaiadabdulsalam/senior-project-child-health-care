import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
  } from '@nestjs/websockets';
  import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
  import { Server, Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  
  type JwtPayload = {
    userId: string;
    role?: string;
    email?: string;
  };
  
  @Injectable()
  @WebSocketGateway({
    namespace: '/notifications',
    cors: {
      origin: '*'
    },
  })
  export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect
  {
    private readonly logger = new Logger(NotificationGateway.name);
  
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly jwtService: JwtService) {}
  
    async handleConnection(client: Socket) {
      try {
        const token = this.extractToken(client);
  
        if (!token) {
          this.logger.warn(`Socket rejected: missing token | socketId=${client.id}`);
          client.disconnect();
          throw new UnauthorizedException('missing token');;
        }
  
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: process.env.JWT_SECRET,
        });
  
        if (!payload?.userId) {
          this.logger.warn(`Socket rejected: invalid payload | socketId=${client.id}`);
          client.disconnect();
          return;
        }
  
        client.data.user = payload;
  
        await client.join(`user:${payload.userId}`);
  
        if (payload.role) {
          await client.join(`role:${payload.role}`);
        }
  
        this.logger.log(
          `Socket connected | socketId=${client.id} | userId=${payload.userId}`,
        );
  
        client.emit('notification:connected', {
          success: true,
          userId: payload.userId,
        });
      } catch (error) {
        this.logger.warn(
          `Socket auth failed | socketId=${client.id} | message=${error?.message}`,
        );
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Socket disconnected | socketId=${client.id}`);
    }
  
    @SubscribeMessage('notification:ping')
    handlePing(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
      return {
        event: 'notification:pong',
        data: {
          ok: true,
          now: new Date().toISOString(),
          echo: body ?? null,
        },
      };
    }
  
    emitToUser(userId: string, payload: unknown) {
      this.server.to(`user:${userId}`).emit('notification:new', payload);
    }
  
    emitUnreadCount(userId: string, unreadCount: number) {
      this.server.to(`user:${userId}`).emit('notification:unread-count', {
        unreadCount,
      });
    }
  
    emitToRole(role: string, payload: unknown) {
      this.server.to(`role:${role}`).emit('notification:new', payload);
    }
  
    private extractToken(client: Socket): string | null {
      const authToken = client.handshake.auth?.token;
      if (authToken && typeof authToken === 'string') {
        return authToken.replace(/^Bearer\s+/i, '').trim();
      }
  
      const authorization = client.handshake.headers?.authorization;
      if (authorization && typeof authorization === 'string') {
        return authorization.replace(/^Bearer\s+/i, '').trim();
      }
  
      return null;
    }
  }