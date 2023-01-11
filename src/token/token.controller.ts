import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  CacheTTL,
} from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('token')
@UseInterceptors(CacheInterceptor)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}
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
  @Get('price')
  @CacheTTL(36000)
  async getPrice() {
    return await this.tokenService.getPrice();
  }
  @Get('decimals')
  @CacheTTL(36000)
  async getDecimals() {
    return await this.tokenService.getDecimals();
  }
  @Get('totalSupply')
  @CacheTTL(36000)
  async totalSupply() {
    return await this.tokenService.totalSupply();
  }
  @Get('totalLocked')
  @CacheTTL(36000)
  async totalLocked() {
    return await this.tokenService.totalLocked();
  }
  @Get('totalCirculating')
  @CacheTTL(36000)
  async totalInCirculation() {
    return await this.tokenService.totalCirculation();
  }
  @Get('stakingRatio')
  @CacheTTL(36000)
  async stakingRatio() {
    return await this.tokenService.stakingRatio();
  }
  @Get('mktCap')
  @CacheTTL(36000)
  async mktCap() {
    return await this.tokenService.mktCap();
  }
}
