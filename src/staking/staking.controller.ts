import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  CacheTTL,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenService } from 'src/token/token.service';
import { DelegationService } from './delegation.service';

@ApiTags('Staking')
@Controller('staking')
@UseInterceptors(CacheInterceptor)
export class StakingController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly delegationService: DelegationService,
  ) {}

  /**
   * Returns the current TARA staked in the ecosystem
   * @returns staked supply in ETH
   */
  @Get('totalStake')
  @CacheTTL(36000)
  async totalSupply() {
    return await this.tokenService.totalStaked();
  }

  /**
   * Returns the current TARA delegated in the ecosystem
   * @returns delegated supply in ETH
   */
  @Get('totalDelegated')
  @CacheTTL(36000)
  async totalDelegated() {
    return (await this.delegationService.totalDelegated()).totalDelegated;
  }

  /**
   * Returns the current avegare weighted validator commission in the ecosystem
   * @returns avegrage weighted validator commission
   */
  @Get('AVC')
  @CacheTTL(36000)
  async avgValdatorCommission() {
    return (await this.delegationService.averageWeightedCommission())
      .averageWeightedCommission;
  }

  /**
   * Returns the current avegare staking validator yield in the ecosystem
   * @returns avegare staking validator yield
   */
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
