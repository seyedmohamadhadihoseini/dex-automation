export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  pair: string;
  liquidity: string;
  liquidityETH: string;
  buyPrice: string;
  currentPrice: string;
  profit: number;
  buyTime: Date;
  buyTransactionHash: string;
  sellTransactionHash?: string;
  status: 'active' | 'sold' | 'stopped';
}

export interface TokenPair {
  token0: string;
  token1: string;
  pair: string;
  reserves0: string;
  reserves1: string;
  liquidity: string;
}

export interface TradeResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: string;
  gasPrice?: string;
}

