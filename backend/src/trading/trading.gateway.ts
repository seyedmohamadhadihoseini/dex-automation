import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TradingService } from './trading.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/trading',
})
export class TradingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TradingGateway.name);
  private connectedClients: Set<Socket> = new Set();

  constructor(private tradingService: TradingService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.startDataBroadcast();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.add(client);
    
    // Send initial data to the newly connected client
    this.sendInitialData(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client);
  }

  private async sendInitialData(client: Socket) {
    try {
      const [status, tokens, logs, inputs] = await Promise.all([
        this.tradingService.getServerStatus(),
        this.tradingService.getActiveTokens(),
        this.tradingService.getLogs(),
        this.tradingService.getTradingInputs(),
      ]);

      client.emit('server-status', status);
      client.emit('active-tokens', tokens);
      client.emit('logs', logs);
      client.emit('trading-inputs', inputs);
    } catch (error) {
      this.logger.error('Failed to send initial data', error);
    }
  }

  private startDataBroadcast() {
    // Broadcast server status every 5 seconds
    setInterval(async () => {
      if (this.connectedClients.size > 0) {
        try {
          const status = await this.tradingService.getServerStatus();
          this.server.emit('server-status', status);
        } catch (error) {
          this.logger.error('Failed to broadcast server status', error);
        }
      }
    }, 5000);

    // Broadcast active tokens every 10 seconds
    setInterval(async () => {
      if (this.connectedClients.size > 0) {
        try {
          const tokens = this.tradingService.getActiveTokens();
          this.server.emit('active-tokens', tokens);
        } catch (error) {
          this.logger.error('Failed to broadcast active tokens', error);
        }
      }
    }, 10000);

    // Broadcast logs every 30 seconds
    setInterval(async () => {
      if (this.connectedClients.size > 0) {
        try {
          const logs = this.tradingService.getLogs();
          
          this.server.emit('logs', logs);
        } catch (error) {
          this.logger.error('Failed to broadcast logs', error);
        }
      }
    }, 2000);
  }

  // Manual broadcast methods for immediate updates
  broadcastServerStatus() {
    this.tradingService.getServerStatus().then(status => {
      this.server.emit('server-status', status);
    });
  }

  broadcastActiveTokens() {
    const tokens = this.tradingService.getActiveTokens();
    this.server.emit('active-tokens', tokens);
  }

  broadcastLogs() {
    const logs = this.tradingService.getLogs();
    this.server.emit('logs', logs);
  }

  broadcastTradingInputs() {
    const inputs = this.tradingService.getTradingInputs();
    this.server.emit('trading-inputs', inputs);
  }

  // Client subscription handlers
  @SubscribeMessage('subscribe-status')
  handleSubscribeStatus(client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to status updates`);
    this.sendInitialData(client);
  }

  @SubscribeMessage('subscribe-tokens')
  handleSubscribeTokens(client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to token updates`);
    const tokens = this.tradingService.getActiveTokens();
    client.emit('active-tokens', tokens);
  }

  @SubscribeMessage('subscribe-logs')
  handleSubscribeLogs(client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to log updates`);
    const logs = this.tradingService.getLogs();
    client.emit('logs', logs);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }
}

