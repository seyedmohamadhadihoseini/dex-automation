import { Module } from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { TradingGateway } from './trading.gateway';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AppConfigModule } from '../config/config.module';

@Module({
  imports: [BlockchainModule, AppConfigModule],
  providers: [TradingService, TradingGateway],
  controllers: [TradingController],
  exports: [TradingService, TradingGateway],
})
export class TradingModule {}

