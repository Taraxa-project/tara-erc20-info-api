import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import * as Tara from './contracts/Tara.json';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, map } from 'rxjs';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private ethersProvider: ethers.providers.JsonRpcProvider;
  private tokenContract: ethers.Contract;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
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
  async getPrice() {
    const taraDetailsCG = this.configService.get<string>('coinGeckoTaraxaApi');
    let priceDetails;
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      const realTimePriceData = await firstValueFrom(
        this.httpService.get(taraDetailsCG, { headers }).pipe(
          map((res) => {
            return res.data;
          }),
          catchError((error) => {
            this.logger.error(error);
            throw new ForbiddenException('API not available');
          }),
        ),
      );
      priceDetails = realTimePriceData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.',
      );
    }
    return Number(priceDetails.taraxa.usd || 0);
  }
  async totalSupply() {
    const decimals = await this.tokenContract.decimals();
    const totalSupply = await this.tokenContract.totalSupply();
    return totalSupply.div(BigNumber.from(10).pow(decimals)).toString();
  }
  async totalStaked() {
    const stakingAddress = this.configService.get<string>('stakingAddress');
    if (stakingAddress) {
      const decimals = await this.tokenContract.decimals();
      const totalStaked = await this.tokenContract.balanceOf(stakingAddress);
      return totalStaked.div(BigNumber.from(10).pow(decimals)).toString();
    } else return '0';
  }
  async totalLocked() {
    const deployerAddress = this.configService.get<string>('deployerAddress');
    if (deployerAddress) {
      const decimals = await this.tokenContract.decimals();
      const totalLocked = await this.tokenContract.balanceOf(deployerAddress);
      return totalLocked.div(BigNumber.from(10).pow(decimals)).toString();
    } else return '0';
  }
  async totalCirculation() {
    return (
      Number(await this.totalSupply()) -
      Number(await this.totalLocked()) -
      Number(await this.totalStaked())
    );
  }
  async stakingRatio() {
    return (
      (Number(await this.totalStaked()) /
        (Number(await this.totalSupply()) - Number(await this.totalLocked()))) *
      100
    );
  }
  async mktCap() {
    return Number(await this.totalCirculation()) * (await this.getPrice());
  }
}
