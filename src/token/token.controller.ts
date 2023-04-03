import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  CacheTTL,
  CacheKey,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';

@ApiTags('Token')
@Controller('token')
@UseInterceptors(CacheInterceptor)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @CacheTTL(30)
  @CacheKey('marketDetails')
  async getTokenData() {
    return await this.tokenService.tokenData();
  }

  @Get('name')
  @CacheTTL(36000)
  async getName() {
    return await this.tokenService.getName();
  }
  @Get('symbol')
  @CacheTTL(36000)
  async getSymbol() {
    return await this.tokenService.getSymbol();
  }
  /**
   * Returns the current TARA price
   * @returns price as float
   */
  @Get('price')
  @CacheTTL(30)
  @CacheKey('price')
  async getPrice() {
    return (await this.tokenService.marketDetails()).price;
  }
  @Get('decimals')
  @CacheTTL(36000)
  async getDecimals() {
    return await this.tokenService.getDecimals();
  }

  /**
   * Returns the current TARA supply
   * @returns supply in ETH
   */
  @Get('totalSupply')
  @CacheTTL(36000)
  async totalSupply() {
    return await this.tokenService.totalSupply();
  }

  /**
   * Returns the current TARA locked
   * @returns locked supply in ETH
   */
  @Get('totalLocked')
  @CacheTTL(36000)
  async totalLocked() {
    return await this.tokenService.totalLocked();
  }
  /**
   * Returns the current TARA in circulation
   * @returns circulating supply in ETH
   */
  @Get('totalCirculating')
  async totalInCirculation() {
    return (await this.tokenService.marketDetails()).circulatingSupply;
  }
  /**
   * Returns the current TARA stakign ratio
   * @returns staking ratio percentage value with 15-precision decimals as float
   */
  @Get('stakingRatio')
  @CacheTTL(36000)
  async stakingRatio() {
    return await this.tokenService.stakingRatio();
  }
  /**
   * Returns the current TARA market cap
   * @returns market cap in 8-precision decimals as float
   */
  @Get('mktCap')
  async mktCap() {
    return (await this.tokenService.marketDetails()).marketCap;
  }
}
