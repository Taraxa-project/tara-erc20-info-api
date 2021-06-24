import { Controller, Get } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}
  @Get('name')
  async getName() {
    return await this.tokenService.getName();
  }
  @Get('symbol')
  async getSymbol() {
    return await this.tokenService.getSymbol();
  }
  @Get('decimals')
  async getDecimals() {
    return await this.tokenService.getDecimals();
  }
  @Get('totalSupply')
  async totalSupply() {
    return await this.tokenService.totalSupply();
  }
}
