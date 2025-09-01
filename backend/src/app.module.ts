import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TradingModule } from './trading/trading.module';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    BlockchainModule,
    TradingModule,
  ],
})
export class AppModule {}

