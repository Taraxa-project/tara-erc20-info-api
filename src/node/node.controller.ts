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

  @Get('totalActive')
  @CacheTTL(36000)
  async totalActiveValidatorsMainnet() {
    return (await this.nodeService.noActiveValidators()).totalActive;
  }

  @Get('totalActiveTestnet')
  @CacheTTL(36000)
  async totaltotalActiveValidatorsTestnet() {
    return (await this.nodeService.noActiveValidators(true)).totalActive;
  }
}
