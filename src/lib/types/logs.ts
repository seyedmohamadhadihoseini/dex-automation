export interface LogEntry {
  timestamp: Date;
  type: 'success' | 'warning' | 'error';
  message: string;
  tokenAddress?: string;
  transactionHash?: string;
  details?: string;
}