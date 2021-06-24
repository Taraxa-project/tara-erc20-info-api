import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as Tara from './contracts/Tara.json';

@Injectable()
export class TokenService {
  private ethersProvider: ethers.providers.JsonRpcProvider;
  private tokenContract: ethers.Contract;

  constructor(private configService: ConfigService) {
    this.ethersProvider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('provider'),
    );

    this.tokenContract = new ethers.Contract(
      this.configService.get<string>('tokenAddress'),
      Tara,
      this.ethersProvider,
    );
  }
  async getName() {
    return await this.tokenContract.name();
  }
  async getSymbol() {
    return await this.tokenContract.symbol();
  }
  async getDecimals() {
    const decimals = await this.tokenContract.decimals();
    return decimals.toString();
  }
  async totalSupply() {
    const totalSupply = await this.tokenContract.totalSupply();
    return totalSupply.toString();
  }
}
