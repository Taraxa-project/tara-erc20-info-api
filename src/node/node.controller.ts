import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  CacheTTL,
} from '@nestjs/common';
import { NodeService } from './node.service';

@Controller('validators')
@UseInterceptors(CacheInterceptor)
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

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
