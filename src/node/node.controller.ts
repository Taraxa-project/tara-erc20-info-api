import {
  Controller,
  Get,
  CacheTTL,
  CacheInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NodeService } from './node.service';

@ApiTags('Validators')
@Controller('validators')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  async validatorData() {
    const activeMainnet = (
      await this.nodeService.noActiveValidators()
    ).totalActive.toString();
    const activeTestnet = (
      await this.nodeService.noActiveValidators(true)
    ).totalActive.toString();
    // const cumulativeCommission = await this.nodeService.cumulativeCommisson();
    return {
      activeMainnet,
      activeTestnet,
      cumulativeCommission: '0',
    };
  }

  /**
   * Returns the active validators in the past week for the Taraxa Mainnet
   * @returns active validator amount
   */
  @Get('totalActive')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totalActiveValidatorsMainnet() {
    return (await this.nodeService.noActiveValidators()).totalActive.toString();
  }

  /**
   * Returns the active validators in the past week for the Taraxa Testnet
   * @returns active validator amount
   */
  @Get('totalActiveTestnet')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totaltotalActiveValidatorsTestnet() {
    return (
      await this.nodeService.noActiveValidators(true)
    ).totalActive.toString();
  }

  /**
   * Returns the cumulative commission earned by Taraxa Validators on the Taraxa Mainnet
   * @returns cumulative commission in ETH
   */
  @Get('cumulativeCommission')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async cumulativeCommission() {
    // return await this.nodeService.cumulativeCommisson();
    return '0';
  }
}
