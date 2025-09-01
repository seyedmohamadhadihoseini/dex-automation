import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { UniswapService } from './uniswap.service';
import { AppConfigModule } from '../config/config.module';

@Module({
  imports: [AppConfigModule],
  providers: [BlockchainService, UniswapService],
  exports: [BlockchainService, UniswapService],
})
export class BlockchainModule {}

