import { IsNumber, IsBoolean, IsString, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateInputsDto {
  @IsNumber()
  @Min(0.1)
  liquidityETH: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  tokensQty: number;

  @IsNumber()
  @Min(1)
  profit: number;

  @IsNumber()
  @Min(0.001)
  entryValueETH: number;

  @IsNumber()
  @Min(0.1)
  @Max(10)
  inputsCheck: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  buyCommission: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  sellCommission: number;

  @IsBoolean()
  salesPossibility: boolean;

  @IsString()
  @IsNotEmpty()
  walletPrivateKey: string;
}

export class SellTokenDto {
  @IsString()
  @IsNotEmpty()
  tokenAddress: string;
}

export class StopTokenDto {
  @IsString()
  @IsNotEmpty()
  tokenAddress: string;
}

