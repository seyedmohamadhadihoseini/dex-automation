import { Controller, Get, Post, Put, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TradingService } from './trading.service';
import { UpdateInputsDto, SellTokenDto, StopTokenDto } from '../dto/trading.dto';
import { Token } from '../interfaces/token.interface';
import { TradingInputs, LogEntry, ServerStatus } from '../interfaces/trade.interface';
  
@Controller('trading')
@UseGuards(AuthGuard('jwt'))
export class TradingController {
  constructor(private tradingService: TradingService) { }

  // Server Control Endpoints
  @Post('server/start')
  @HttpCode(HttpStatus.OK)
  async startServer(): Promise<{ message: string }> {
    await this.tradingService.startServer();
    return { message: 'Server started successfully' };
  }

  @Post('server/stop')
  @HttpCode(HttpStatus.OK)
  async stopServer(): Promise<{ message: string }> {
    await this.tradingService.stopServer();
    return { message: 'Server stopped successfully' };
  }

  @Post('pair-listen/start')
  @HttpCode(HttpStatus.OK)
  async startPairListen(): Promise<{ message: string }> {
    await this.tradingService.startPairListen();
    return { message: 'Started listening for new pairs' };
  }

  @Post('pair-listen/stop')
  @HttpCode(HttpStatus.OK)
  async stopPairListen(): Promise<{ message: string }> {
    await this.tradingService.stopPairListen();
    return { message: 'Stopped listening for new pairs' };
  }

  // Token Management Endpoints
  @Post('tokens/:address/sell')
  @HttpCode(HttpStatus.OK)
  async sellToken(@Param('address') address: string): Promise<{ message: string }> {
    await this.tradingService.sellToken(address);
    return { message: `Token ${address} sell order executed` };
  }

  @Post('tokens/:address/stop')
  @HttpCode(HttpStatus.OK)
  async stopToken(@Param('address') address: string): Promise<{ message: string }> {
    await this.tradingService.stopToken(address);
    return { message: `Token ${address} monitoring stopped` };
  }

  // Configuration Endpoints
  @Put('inputs')
  @HttpCode(HttpStatus.OK)
  updateInputs(@Body() inputs: UpdateInputsDto): Promise<{ message: string }> {
    this.tradingService.updateInputs(inputs);
    return Promise.resolve({ message: 'Trading inputs updated successfully' });
  }

  @Get('inputs')
  getTradingInputs(): Promise<TradingInputs> {
    return Promise.resolve(this.tradingService.getTradingInputs());
  }

  // Data Endpoints
  @Get('status')
  async getServerStatus(): Promise<ServerStatus> {
    return this.tradingService.getServerStatus();
  }

  @Get('tokens')
  getActiveTokens(): Promise<Token[]> {
    return Promise.resolve(this.tradingService.getActiveTokens());
  }

  @Get('logs')
  getLogs(): Promise<LogEntry[]> {
    return Promise.resolve(this.tradingService.getLogs());
  }
}

