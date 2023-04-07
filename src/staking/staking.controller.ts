import {
  Controller,
  Get,
  CacheTTL,
  CacheInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenService } from 'src/token/token.service';
import { DelegationService } from './delegation.service';

@ApiTags('Staking')
@Controller('staking')
export class StakingController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly delegationService: DelegationService,
  ) {}

  @Get()
  async stakingData() {
    const totalStaked = await this.tokenService.totalStaked();
    const totalDelegated = await this.delegationService.totalDelegated();
    const avgValidatorCommission = (
      await this.delegationService.averageWeightedCommission()
    ).averageWeightedCommission;
    const avgStakingYield = 20 - (await this.avgValidatorCommission());
    return {
      totalStaked,
      totalDelegated,
      avgValidatorCommission,
      avgStakingYield,
    };
  }
  /**
   * Returns the current TARA staked in the ecosystem
   * @returns staked supply in ETH
   */
  @Get('totalStake')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totalStaked() {
    return await this.tokenService.totalStaked();
  }

  /**
   * Returns the current TARA delegated in the ecosystem
   * @returns delegated supply in ETH
   */
  @Get('totalDelegated')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totalDelegated() {
    return await this.delegationService.totalDelegated();
  }

  /**
   * Returns the current avegare weighted validator commission in the ecosystem
   * @returns avegrage weighted validator commission
   */
  @Get('avc')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async avgValidatorCommission() {
    return (await this.delegationService.averageWeightedCommission())
      .averageWeightedCommission;
  }

  /**
   * Returns the current avegare staking validator yield in the ecosystem
   * @returns avegare staking validator yield
   */
  @Get('asy')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async avgStakingYeild() {
    return 20 - (await this.avgValidatorCommission());
  }
}
