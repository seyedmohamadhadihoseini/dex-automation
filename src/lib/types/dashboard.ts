export interface ServerStatus {
  isServerRunning: boolean;
  isPairListenRunning: boolean;
  activeTokensCount: number;
  totalWETH: string;
  lastUpdate: Date;
}