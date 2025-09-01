import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { AppConfigService } from '../config/config.service';
import { TradeResult } from '../interfaces/token.interface';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.WebSocketProvider;
  private httpProvider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(private configService: AppConfigService) {
    this.initializeProviders();
  }

  private initializeProviders() {
    try {
      // WebSocket provider for real-time events
      this.provider = new ethers.WebSocketProvider(this.configService.infuraUrl);
      
      // HTTP provider for transactions
      this.httpProvider = new ethers.JsonRpcProvider(this.configService.infuraHttpUrl);
      
      // Initialize wallet
      this.wallet = new ethers.Wallet(this.configService.walletPrivateKey, this.httpProvider);
      
      this.logger.log('Blockchain providers initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain providers', error);
      throw error;
    }
  }

  getProvider(): ethers.WebSocketProvider {
    return this.provider;
  }

  getHttpProvider(): ethers.JsonRpcProvider {
    return this.httpProvider;
  }

  getWallet(): ethers.Wallet {
    return this.wallet;
  }

  async getETHBalance(): Promise<string> {
    try {
      const balance = await this.wallet.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error('Failed to get ETH balance', error);
      throw error;
    }
  }

  async getTokenBalance(tokenAddress: string): Promise<string> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ],
        this.wallet,
      );

      const balance = await tokenContract.balanceOf(this.wallet.address);
      const decimals = await tokenContract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      this.logger.error(`Failed to get token balance for ${tokenAddress}`, error);
      throw error;
    }
  }

  async estimateGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.httpProvider.getFeeData();
      // Use gasPrice with 20% increase for faster confirmation
      const gasPrice = feeData.gasPrice * BigInt(120) / BigInt(100);
      return gasPrice;
    } catch (error) {
      this.logger.error('Failed to estimate gas price', error);
      throw error;
    }
  }

  async sendTransaction(transaction: any): Promise<TradeResult> {
    try {
      const gasPrice = await this.estimateGasPrice();
      const txWithGas = {
        ...transaction,
        gasPrice,
        gasLimit: 300000, // Conservative gas limit
      };

      const tx = await this.wallet.sendTransaction(txWithGas);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: gasPrice.toString(),
      };
    } catch (error) {
      this.logger.error('Transaction failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async reconnectWebSocket() {
    try {
      this.logger.log('Reconnecting WebSocket provider...');
      this.provider.destroy();
      this.provider = new ethers.WebSocketProvider(this.configService.infuraUrl);
      this.logger.log('WebSocket provider reconnected successfully');
    } catch (error) {
      this.logger.error('Failed to reconnect WebSocket provider', error);
      throw error;
    }
  }
}

