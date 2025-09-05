import { Injectable, Logger } from '@nestjs/common';
import { UniswapService } from '../blockchain/uniswap.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Token } from '../interfaces/token.interface';
import { TradingInputs, LogEntry, ServerStatus } from '../interfaces/trade.interface';
import { UpdateInputsDto } from '../dto/trading.dto';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  
  private isServerRunning = false;
  private isPairListenRunning = false;
  private activeTokens: Map<string, Token> = new Map();
  private logs: LogEntry[] = [];
  
  private tradingInputs: TradingInputs = {
    liquidityETH: 3,
    tokensQty: 10,
    profit: 500,
    entryValueETH: 0.025,
    inputsCheck: 2,
    buyCommission: 10,
    sellCommission: 10,
    salesPossibility: true,
    walletPrivateKey: '',
  };

  constructor(
    private uniswapService: UniswapService,
    private blockchainService: BlockchainService,
  ) {}

  // Server Control Methods
  async startServer(): Promise<void> {
    try {
      this.isServerRunning = true;
      this.addLog('success', 'Server started successfully');
      this.logger.log('Trading server started');
    } catch (error) {
      this.addLog('error', `Failed to start server: ${error.message}`);
      throw error;
    }
  }

  async stopServer(): Promise<void> {
    try {
      this.isServerRunning = false;
      this.isPairListenRunning = false;
      this.addLog('success', 'Server stopped successfully');
      this.logger.log('Trading server stopped');
    } catch (error) {
      this.addLog('error', `Failed to stop server: ${error.message}`);
      throw error;
    }
  }

  async startPairListen(): Promise<void> {
    try {
      if (!this.isServerRunning) {
        throw new Error('Server must be running to start pair listening');
      }
      
      // const token = await this.uniswapService.getTokenInfo('0x47Db4113e9ec4444c857B177729c2f2960490A23','0xdD003624DB2754B33531f202a7841C9035718Ab4');

      
      // console.log(token.decimals);
      this.isPairListenRunning = true;
      this.addLog('success', 'Started listening for new token pairs');
      
      // Start listening for new pairs
      await this.uniswapService.listenForNewPairs((token: Token) => {
        this.handleNewToken(token);
      });

      this.logger.log('Started listening for new Uniswap pairs');
    } catch (error) {
      this.isPairListenRunning = false;
      this.addLog('error', `Failed to start pair listening: ${error.message}`);
      throw error;
    }
  }

  async stopPairListen(): Promise<void> {
    try {
      this.isPairListenRunning = false;
      this.addLog('success', 'Stopped listening for new token pairs');
      this.logger.log('Stopped listening for new pairs');
    } catch (error) {
      this.addLog('error', `Failed to stop pair listening: ${error.message}`);
      throw error;
    }
  }

  // Token Management Methods
  private async handleNewToken(token: Token): Promise<void> {
    try {
      this.logger.log(`Processing new token: ${token.symbol} (${token.address})`);
      
      // Check if we have reached the maximum number of tokens
      if (this.activeTokens.size >= this.tradingInputs.tokensQty) {
        this.addLog('warning', `Maximum token limit (${this.tradingInputs.tokensQty}) reached. Skipping ${token.symbol}`);
        return;
      }

      // Check liquidity requirement
      const liquidityETH = parseFloat(token.liquidityETH);
      if (liquidityETH < this.tradingInputs.liquidityETH) {
        this.addLog('warning', `Token ${token.symbol} liquidity (${liquidityETH} ETH) below minimum requirement (${this.tradingInputs.liquidityETH} ETH)`);
        return;
      }

      // Test sales possibility if enabled
      if (this.tradingInputs.salesPossibility) {
        const testResult = await this.testTokenSalesPossibility(token);
        if (!testResult.canSell || 
            testResult.buyCommission > this.tradingInputs.buyCommission ||
            testResult.sellCommission > this.tradingInputs.sellCommission) {
          
          this.addLog('warning', `Token ${token.symbol} failed sales possibility test or commission too high`);
          return;
        }
      }

      // Execute main trade
      await this.executeMainTrade(token);

    } catch (error) {
      this.addLog('error', `Error processing new token ${token.symbol}: ${error.message}`);
      this.logger.error('Error handling new token', error);
    }
  }

  private async testTokenSalesPossibility(token: Token): Promise<{ canSell: boolean; buyCommission: number; sellCommission: number ,error?:string}> {
    try {
      const testAmountETH = (this.tradingInputs.entryValueETH * this.tradingInputs.inputsCheck / 100).toString();
      
      this.addLog('success', `Testing sales possibility for ${token.symbol} with ${testAmountETH} ETH`);
      
      const result = await this.uniswapService.testSalesPossibility(token, testAmountETH);
      
      if (result.canSell) {
        this.addLog('success', `${token.symbol} passed sales test. Buy commission: ${result.buyCommission}%, Sell commission: ${result.sellCommission}%`);
      } else {
        this.addLog('warning', `${token.symbol} failed sales test (Honeypot detected)`);
        this.addLog('error',`${token.symbol} failed because of ${result.error} `)
      }

      return result;
    } catch (error) {
      this.addLog('error', `Sales possibility test failed for ${token.symbol}: ${error.message}`);
      return { canSell: false, buyCommission: 100, sellCommission: 100 };
    }
  }

  private async executeMainTrade(token: Token): Promise<void> {
    try {
      this.addLog('success', `Executing main trade for ${token.symbol} with ${this.tradingInputs.entryValueETH} ETH`);
      
      const buyResult = await this.uniswapService.buyToken(token, this.tradingInputs.entryValueETH.toString());
      console.log(`buy result:${buyResult}`);
      if (buyResult.success) {
        // Update token with purchase information
        token.buyTransactionHash = buyResult.transactionHash;
        token.buyTime = new Date();
        token.status = 'active';
        
        // Add to active tokens
        this.activeTokens.set(token.address, token);
        
        this.addLog('success', `Successfully bought ${token.symbol}. Transaction: ${buyResult.transactionHash}`);
        
        // Start monitoring this token for profit target
        this.startTokenMonitoring(token);
        
      } else {
        console.log('the logs added');
        this.addLog('error', `Failed to buy ${token.symbol}: ${buyResult.error}`);
      }
    } catch (error) {
      this.addLog('error', `Main trade execution failed for ${token.symbol}: ${error.message}`);
      this.logger.error('Main trade execution failed', error);
    }
  }

  private async startTokenMonitoring(token: Token): Promise<void> {
    // Start price monitoring for this token
    const monitoringInterval = setInterval(async () => {
      try {
        if (!this.activeTokens.has(token.address) || !this.isServerRunning) {
          clearInterval(monitoringInterval);
          return;
        }

        const currentPrice = await this.uniswapService.getCurrentPrice(token.address, token.pair);
        const buyPrice = parseFloat(token.buyPrice);
        const currentPriceNum = parseFloat(currentPrice);
        
        // Calculate profit percentage
        const profitPercentage = ((currentPriceNum - buyPrice) / buyPrice) * 100;
        
        // Update token data
        token.currentPrice = currentPrice;
        token.profit = profitPercentage;
        this.activeTokens.set(token.address, token);

        // Check if profit target is reached
        if (profitPercentage >= this.tradingInputs.profit) {
          this.addLog('success', `Profit target reached for ${token.symbol} (${profitPercentage.toFixed(2)}%). Executing sell order.`);
          await this.sellToken(token.address);
          clearInterval(monitoringInterval);
        }

      } catch (error) {
        this.logger.error(`Error monitoring token ${token.symbol}`, error);
      }
    }, 5000); // Check every 5 seconds
  }

  async sellToken(tokenAddress: string): Promise<void> {
    try {
      const token = this.activeTokens.get(tokenAddress);
      if (!token) {
        throw new Error('Token not found in active tokens');
      }

      // Get current token balance
      const tokenBalance = await this.blockchainService.getTokenBalance(tokenAddress);
      
      const sellResult = await this.uniswapService.sellToken(tokenAddress, tokenBalance);
      
      if (sellResult.success) {
        token.sellTransactionHash = sellResult.transactionHash;
        token.status = 'sold';
        
        this.addLog('success', `Successfully sold ${token.symbol} with ${token.profit.toFixed(2)}% profit. Transaction: ${sellResult.transactionHash}`);
        
        // Remove from active tokens
        this.activeTokens.delete(tokenAddress);
      } else {
        this.addLog('error', `Failed to sell ${token.symbol}: ${sellResult.error}`);
      }
    } catch (error) {
      this.addLog('error', `Sell operation failed for token ${tokenAddress}: ${error.message}`);
      throw error;
    }
  }

  async stopToken(tokenAddress: string): Promise<void> {
    try {
      const token = this.activeTokens.get(tokenAddress);
      if (!token) {
        throw new Error('Token not found in active tokens');
      }

      token.status = 'stopped';
      this.activeTokens.delete(tokenAddress);
      
      this.addLog('success', `Stopped monitoring ${token.symbol}`);
    } catch (error) {
      this.addLog('error', `Stop operation failed for token ${tokenAddress}: ${error.message}`);
      throw error;
    }
  }

  // Configuration Methods
  updateInputs(inputs: UpdateInputsDto): void {
    this.tradingInputs = { ...inputs };
    this.addLog('success', 'Trading inputs updated successfully');
    this.logger.log('Trading inputs updated', inputs);
  }

  getTradingInputs(): TradingInputs {
    return { ...this.tradingInputs };
  }

  // Status and Data Methods
  async getServerStatus(): Promise<ServerStatus> {
    const totalWETH = await this.calculateTotalWETH();
    
    return {
      isServerRunning: this.isServerRunning,
      isPairListenRunning: this.isPairListenRunning,
      activeTokensCount: this.activeTokens.size,
      totalWETH,
      lastUpdate: new Date(),
    };
  }

  getActiveTokens(): Token[] {
    return Array.from(this.activeTokens.values());
  }

  getLogs(): LogEntry[] {
    return [...this.logs].reverse(); // Return newest first
  }

  private async calculateTotalWETH(): Promise<string> {
    try {
      const ethBalance = await this.blockchainService.getETHBalance();
      return ethBalance;
    } catch (error) {
      this.logger.error('Failed to calculate total WETH', error);
      return '0';
    }
  }

  private addLog(type: 'success' | 'warning' | 'error', message: string, tokenAddress?: string, transactionHash?: string, details?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      type,
      message,
      tokenAddress,
      transactionHash,
      details,
    };

    this.logs.push(logEntry);
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    this.logger.log(`[${type.toUpperCase()}] ${message}`);
  }
}

