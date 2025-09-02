import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { BlockchainService } from './blockchain.service';
import { AppConfigService } from '../config/config.service';
import { Token, TokenPair, TradeResult } from '../interfaces/token.interface';

@Injectable()
export class UniswapService {
  private readonly logger = new Logger(UniswapService.name);

  // Uniswap V2 Factory ABI (minimal)
  private readonly factoryABI = [
    'event PairCreated(address indexed token0, address indexed token1, address pair, uint)',
    'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  ];

  // Uniswap V2 Pair ABI (minimal)
  private readonly pairABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
  ];

  // Uniswap V2 Router ABI (minimal)
  private readonly routerABI = [
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
    'function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)',
  ];

  // ERC20 ABI (minimal)
  private readonly erc20ABI = [
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)',
    'function totalSupply() external view returns (uint256)',
    'function balanceOf(address owner) external view returns (uint256)',
    'function approve(address spender, uint256 value) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
  ];

  private readonly UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

  constructor(
    private blockchainService: BlockchainService,
    private configService: AppConfigService,
  ) { }

  async listenForNewPairs(callback: (token: Token) => void) {
    try {
      const provider = this.blockchainService.getProvider();
      const factoryContract = new ethers.Contract(
        this.configService.uniswapV2Factory,
        this.factoryABI,
        provider,
      );

      this.logger.log('Starting to listen for new Uniswap pairs...');

      factoryContract.on('PairCreated', async (token0, token1, pair, allPairsLength) => {
        try {
          this.logger.log(`New pair created: ${token0}/${token1} at ${pair}`);

          // Check if one of the tokens is WETH
          const wethAddress = this.configService.wethAddress;
          let tokenAddress: string;

          if (token0.toLowerCase() === wethAddress.toLowerCase()) {
            tokenAddress = token1;
          } else if (token1.toLowerCase() === wethAddress.toLowerCase()) {
            tokenAddress = token0;
          } else {
            // Skip pairs that don't include WETH
            return;
          }

          // Get token information
          const tokenInfo = await this.getTokenInfo(tokenAddress, pair);
          if (tokenInfo) {
            callback(tokenInfo);
          }
        } catch (error) {
          this.logger.error('Error processing new pair', error);
        }
      });

    } catch (error) {
      this.logger.error('Failed to listen for new pairs', error);
      throw error;
    }
  }

  async getTokenInfo(tokenAddress: string, pairAddress: string): Promise<Token | null> {
    try {
      const provider = this.blockchainService.getProvider();

      // Get token contract
      const tokenContract = new ethers.Contract(tokenAddress, this.erc20ABI, provider);

      // Get pair contract
      const pairContract = new ethers.Contract(pairAddress, this.pairABI, provider);

      // Get token details
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
      ]);

      // Get pair reserves
      const reserves = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      // Determine which reserve is WETH
      const wethAddress = this.configService.wethAddress;
      let wethReserve: bigint;
      let tokenReserve: bigint;

      if (token0.toLowerCase() === wethAddress.toLowerCase()) {
        wethReserve = reserves.reserve0;
        tokenReserve = reserves.reserve1;
      } else {
        wethReserve = reserves.reserve1;
        tokenReserve = reserves.reserve0;
      }

      // Calculate liquidity in ETH
      const liquidityETH = ethers.formatEther(wethReserve);

      // Calculate initial price (WETH per token)
      // Calculate initial price (WETH per token)
      const decimalsNumber = Number(decimals);
      const price = (wethReserve * BigInt(10 ** decimalsNumber)) / tokenReserve;
      const buyPrice = ethers.formatEther(price);

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        pair: pairAddress,
        liquidity: tokenReserve.toString(),
        liquidityETH,
        buyPrice,
        currentPrice: buyPrice,
        profit: 0,
        buyTime: new Date(),
        buyTransactionHash: '',
        status: 'active',
      };

    } catch (error) {
      this.logger.error(`Failed to get token info for ${tokenAddress}`, error);
      return null;
    }
  }

async buyToken(tokenAddress: string, amountETH: string): Promise<TradeResult> {
 try {
   const wallet = this.blockchainService.getWallet();
   const provider = this.blockchainService.getProvider();
   const routerContract = new ethers.Contract(this.UNISWAP_V2_ROUTER, this.routerABI, wallet);
   const pairAddress = await this.getPairAddress(tokenAddress, this.configService.wethAddress);

   const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
   if (pairAddress === ZERO_ADDRESS) {
     throw new Error(`Pair does not exist for token ${tokenAddress}`);
   }

   const pairContract = new ethers.Contract(pairAddress, this.pairABI, provider);
   const reserves = await pairContract.getReserves();
   const token0 = await pairContract.token0();
   let wethReserve: bigint, tokenReserve: bigint;
   let path: string[];

   // تنظیم مسیر بر اساس ترتیب جفت
   if (token0.toLowerCase() === this.configService.wethAddress.toLowerCase()) {
     wethReserve = reserves.reserve0;
     tokenReserve = reserves.reserve1;
     path = [this.configService.wethAddress, tokenAddress]; // WETH -> Token
   } else {
     wethReserve = reserves.reserve1;
     tokenReserve = reserves.reserve0;
     path = [tokenAddress, this.configService.wethAddress]; // Token -> WETH
   }

   if (wethReserve === 0n || tokenReserve === 0n) {
     throw new Error(`No liquidity for pair ${pairAddress}`);
   }

   const amountIn = ethers.parseEther(amountETH);
   const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
   const amounts = await routerContract.getAmountsOut(amountIn, path);
   if (amounts[1] === 0n) {
     throw new Error(`No output amount for token ${tokenAddress}`);
   }
   const amountOutMin = (amounts[1] * BigInt(95)) / BigInt(100); // 5% لغزش

   this.logger.log(`Token: ${tokenAddress}, AmountIn: ${amountIn}, AmountOutMin: ${amountOutMin}, Path: ${path}, Deadline: ${deadline}, Reserves: WETH=${wethReserve}, Token=${tokenReserve}`);

   const feeData = await provider.getFeeData();
   const gasPrice = feeData.gasPrice;

   const tx = await routerContract.swapExactETHForTokens(
     amountOutMin,
     path,
     wallet.address,
     deadline,
     { value: amountIn, gasLimit: 300000, gasPrice },
   );

   this.logger.log(`Transaction sent: ${tx.hash}`);
   const receipt = await tx.wait();

   return {
     success: true,
     transactionHash: receipt.hash,
     gasUsed: receipt.gasUsed.toString(),
   };
 } catch (error) {
   this.logger.error(`Failed to buy token ${tokenAddress}: ${error.reason || error.message}`);
   return {
     success: false,
     error: error.reason || error.message,
   };
 }
}

async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
 const factoryContract = new ethers.Contract(
   this.configService.uniswapV2Factory,
   this.factoryABI,
   this.blockchainService.getProvider(),
 );
 return await factoryContract.getPair(tokenA, tokenB);
}
  // async buyToken(tokenAddress: string, amountETH: string): Promise<TradeResult> {
  //   try {
  //     const wallet = this.blockchainService.getWallet();
  //     const routerContract = new ethers.Contract(this.UNISWAP_V2_ROUTER, this.routerABI, wallet);

  //     const path = [this.configService.wethAddress, tokenAddress];
  //     const amountIn = ethers.parseEther(amountETH);
  //     const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

  //     // Get expected output amount
  //     const amounts = await routerContract.getAmountsOut(amountIn, path);
  //     const amountOutMin = amounts[1] * BigInt(95) / BigInt(100); // 5% slippage tolerance

  //     const transaction = await routerContract.swapExactETHForTokens(
  //       amountOutMin,
  //       path,
  //       wallet.address,
  //       deadline,
  //       { value: amountIn }
  //     );

  //     const receipt = await transaction.wait();

  //     return {
  //       success: true,
  //       transactionHash: receipt.hash,
  //       gasUsed: receipt.gasUsed.toString(),
  //     };

  //   } catch (error) {
  //     this.logger.error(`Failed to buy token ${tokenAddress}`, error);
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // }

  async sellToken(tokenAddress: string, amount: string): Promise<TradeResult> {
    try {
      const wallet = this.blockchainService.getWallet();
      const routerContract = new ethers.Contract(this.UNISWAP_V2_ROUTER, this.routerABI, wallet);
      const tokenContract = new ethers.Contract(tokenAddress, this.erc20ABI, wallet);

      // First approve the router to spend tokens
      const decimals = await tokenContract.decimals();
      const amountIn = ethers.parseUnits(amount, decimals);

      const approveTx = await tokenContract.approve(this.UNISWAP_V2_ROUTER, amountIn);
      await approveTx.wait();

      const path = [tokenAddress, this.configService.wethAddress];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      // Get expected output amount
      const amounts = await routerContract.getAmountsOut(amountIn, path);
      const amountOutMin = amounts[1] * BigInt(95) / BigInt(100); // 5% slippage tolerance

      const transaction = await routerContract.swapExactTokensForETH(
        amountIn,
        amountOutMin,
        path,
        wallet.address,
        deadline
      );

      const receipt = await transaction.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };

    } catch (error) {
      this.logger.error(`Failed to sell token ${tokenAddress}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getCurrentPrice(tokenAddress: string, pairAddress: string): Promise<string> {
    try {
      const provider = this.blockchainService.getProvider();
      const pairContract = new ethers.Contract(pairAddress, this.pairABI, provider);
      const tokenContract = new ethers.Contract(tokenAddress, this.erc20ABI, provider);

      const reserves = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const decimals = await tokenContract.decimals();

      const wethAddress = this.configService.wethAddress;
      let wethReserve: bigint;
      let tokenReserve: bigint;

      if (token0.toLowerCase() === wethAddress.toLowerCase()) {
        wethReserve = reserves.reserve0;
        tokenReserve = reserves.reserve1;
      } else {
        wethReserve = reserves.reserve1;
        tokenReserve = reserves.reserve0;
      }

      // Calculate price (WETH per token)
      const price = wethReserve * BigInt(10 ** decimals) / tokenReserve;
      return ethers.formatEther(price);

    } catch (error) {
      this.logger.error(`Failed to get current price for ${tokenAddress}`, error);
      throw error;
    }
  }

  async testSalesPossibility(tokenAddress: string, testAmountETH: string): Promise<{ canSell: boolean; buyCommission: number; sellCommission: number }> {
    try {
      // This is a simplified test - in production, you might want to use a more sophisticated approach
      // like calling static functions or using a fork of the mainnet for testing

      const buyResult = await this.buyToken(tokenAddress, testAmountETH);
      if (!buyResult.success) {
        return { canSell: false, buyCommission: 100, sellCommission: 100 };
      }

      // Get token balance
      const tokenBalance = await this.blockchainService.getTokenBalance(tokenAddress);

      const sellResult = await this.sellToken(tokenAddress, tokenBalance);
      if (!sellResult.success) {
        return { canSell: false, buyCommission: 100, sellCommission: 100 };
      }

      // Calculate commissions based on gas used (simplified)
      const buyGasUsed = parseInt(buyResult.gasUsed || '0');
      const sellGasUsed = parseInt(sellResult.gasUsed || '0');

      // Simplified commission calculation (in reality, this would be more complex)
      const buyCommission = Math.min((buyGasUsed / 300000) * 10, 50);
      const sellCommission = Math.min((sellGasUsed / 300000) * 10, 50);

      return {
        canSell: true,
        buyCommission,
        sellCommission,
      };

    } catch (error) {
      this.logger.error(`Failed to test sales possibility for ${tokenAddress}`, error);
      return { canSell: false, buyCommission: 100, sellCommission: 100 };
    }
  }
}

