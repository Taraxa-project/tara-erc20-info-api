import {
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
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
import { Cache } from 'cache-manager';
import { MarketDetails } from '../utils/types';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private ethersProvider: ethers.providers.JsonRpcProvider;
  private tokenContract: ethers.Contract;
  private redisName: string;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.ethersProvider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('provider'),
    );

    this.tokenContract = new ethers.Contract(
      `${this.configService.get<string>('tokenAddress')}`,
      Tara,
      this.ethersProvider,
    );
    this.redisName = `${this.configService.get('redisName')}`;
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
        this.httpService.get(`${taraDetailsCG}`, { headers }).pipe(
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
  async marketDetails() {
    const details = (await this.cacheManager.get(
      this.redisName ? `${this.redisName}_marketCap` : 'marketCap',
    )) as MarketDetails;
    if (details) {
      return details;
    } else {
      try {
        const price = await this.getPrice();
        const circulatingSupply = await this.totalCirculation();
        const marketCap = price * circulatingSupply;
        const marketDetails = {
          price,
          circulatingSupply,
          marketCap,
        };
        await this.cacheManager.set(
          this.redisName ? `${this.redisName}_marketCap` : 'marketCap',
          marketDetails as any,
          30,
        );
        return marketDetails;
      } catch (error) {
        throw new InternalServerErrorException(
          'Fetching market details failed. Reason: ',
          error,
        );
      }
    }
  }

  async tokenData() {
    const marketDetails = await this.marketDetails();
    const name = await this.getName();
    const symbol = await this.getSymbol();
    const decimals = await this.getDecimals();
    const totalSupply = await this.totalSupply();
    const totalLocked = await this.totalLocked();
    const stakingRatio = await this.stakingRatio();
    return {
      name,
      symbol,
      decimals,
      totalSupply,
      totalLocked,
      stakingRatio,
      ...marketDetails,
    };
  }
}
