import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  CacheTTL,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { DelegationService } from './delegation.service';

@Controller('staking')
@UseInterceptors(CacheInterceptor)
export class StakingController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly delegationService: DelegationService,
  ) {}

  @Get('totalStake')
  @CacheTTL(36000)
  async totalSupply() {
    return await this.tokenService.totalStaked();
  }

  @Get('totalDelegated')
  @CacheTTL(36000)
  async totalDelegated() {
    return (await this.delegationService.totalDelegated()).totalDelegated;
  }

  @Get('AVC')
  @CacheTTL(36000)
  async avgValdatorCommission() {
    return (await this.delegationService.averageWeightedCommission())
      .averageWeightedCommission;
  }

  @Get('ASY')
  @CacheTTL(36000)
  async avgStakingYeild() {
    return (
      20 *
      (1 -
        Number(
          (await this.delegationService.averageWeightedCommission())
            .averageWeightedCommission,
        ) /
          100)
    );
  }
}
