import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
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
    namespace: '/chat',
    cors: {
      origin: '*',
    },
  })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ChatGateway.name);
  
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly jwtService: JwtService) {}
  
    async handleConnection(client: Socket) {
      try {
        const token = this.extractToken(client);
  
        if (!token) {
          client.disconnect();
          throw new UnauthorizedException('Missing token');
        }
  
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: process.env.JWT_SECRET,
        });
  
        if (!payload?.userId) {
          client.disconnect();
          return;
        }
  
        client.data.user = payload;
  
        await client.join(`user:${payload.userId}`);
  
        this.logger.log(
          `Chat socket connected | socketId=${client.id} | userId=${payload.userId}`,
        );
  
        client.emit('chat:connected', {
          success: true,
          userId: payload.userId,
        });
      } catch (error) {
        this.logger.warn(
          `Chat socket auth failed | socketId=${client.id} | message=${error?.message}`,
        );
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Chat socket disconnected | socketId=${client.id}`);
    }
  
    @SubscribeMessage('chat:join-conversation')
    async joinConversation(
      @ConnectedSocket() client: Socket,
      @MessageBody() body: { conversationId: string },
    ) {
      await client.join(`conversation:${body.conversationId}`);
  
      return {
        event: 'chat:joined-conversation',
        data: {
          conversationId: body.conversationId,
        },
      };
    }
  
    emitNewMessage(conversationId: string, payload: unknown) {
      this.server
        .to(`conversation:${conversationId}`)
        .emit('chat:new-message', payload);
    }
  
    emitMessageToUser(userId: string, payload: unknown) {
      this.server.to(`user:${userId}`).emit('chat:new-message', payload);
    }
  
    emitConversationRead(conversationId: string, payload: unknown) {
      this.server
        .to(`conversation:${conversationId}`)
        .emit('chat:conversation-read', payload);
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