import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get infuraUrl(): string {
    return this.configService.get<string>('INFURA_URL');
  }

  get infuraHttpUrl(): string {
    return this.configService.get<string>('INFURA_HTTP_URL');
  }

  get walletPrivateKey(): string {
    return this.configService.get<string>('WALLET_PRIVATE_KEY');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get uniswapV2Factory(): string {
    return this.configService.get<string>('UNISWAP_V2_FACTORY');
  }

  get wethAddress(): string {
    return this.configService.get<string>('WETH_ADDRESS');
  }

  get defaultUsername(): string {
    return this.configService.get<string>('DEFAULT_USERNAME');
  }

  get defaultPassword(): string {
    return this.configService.get<string>('DEFAULT_PASSWORD');
  }
}

