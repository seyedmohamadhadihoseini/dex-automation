export interface TradingInputs {
  liquidityETH: number;
  tokensQty: number;
  profit: number;
  entryValueETH: number;
  inputsCheck: number;
  buyCommission: number;
  sellCommission: number;
  salesPossibility: boolean;
  walletPrivateKey: string;
}

export interface LogEntry {
  timestamp: Date;
  type: 'success' | 'warning' | 'error';
  message: string;
  tokenAddress?: string;
  transactionHash?: string;
  details?: any;
}

export interface ServerStatus {
  isServerRunning: boolean;
  isPairListenRunning: boolean;
  activeTokensCount: number;
  totalWETH: string;
  lastUpdate: Date;
}

