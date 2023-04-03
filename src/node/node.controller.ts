import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  CacheTTL,
  CacheKey,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NodeService } from './node.service';

@ApiTags('Validators')
@Controller('validators')
@UseInterceptors(CacheInterceptor)
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  @CacheTTL(30)
  @CacheKey('validators')
  async validatorData() {
    const activeMainnet = (await this.nodeService.noActiveValidators())
      .totalActive;
    const activeTestnet = (await this.nodeService.noActiveValidators(true))
      .totalActive;
    const cumulativeCommission = await this.nodeService.cumulativeCommisson();
    return {
      activeMainnet,
      activeTestnet,
      cumulativeCommission,
    };
  }

  /**
   * Returns the active validators in the past week for the Taraxa Mainnet
   * @returns active validator amount
   */
  @Get('totalActive')
  @CacheTTL(36000)
  async totalActiveValidatorsMainnet() {
    return (await this.nodeService.noActiveValidators()).totalActive;
  }

  /**
   * Returns the active validators in the past week for the Taraxa Testnet
   * @returns active validator amount
   */
  @Get('totalActiveTestnet')
  @CacheTTL(36000)
  async totaltotalActiveValidatorsTestnet() {
    return (await this.nodeService.noActiveValidators(true)).totalActive;
  }

  /**
   * Returns the cumulative commission earned by Taraxa Validators on the Taraxa Mainnet
   * @returns cumulative commission in ETH
   */
  @Get('cumulativeCommission')
  @CacheTTL(36000)
  async cumulativeCommission() {
    return await this.nodeService.cumulativeCommisson();
  }
}
