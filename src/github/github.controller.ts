import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  CacheTTL,
} from '@nestjs/common';
import { GitHubService } from './github.service';

@Controller('contributions')
@UseInterceptors(CacheInterceptor)
export class GitHubController {
  constructor(private readonly ghService: GitHubService) {}

  /**
   * Returns the number of commits from the current month from the Taraxa-project organization
   * @returns number of commits of current month
   */
  @Get('commits')
  @CacheTTL(36000)
  async commitsOfCurrentMonth() {
    return (await this.ghService.commitsOfThisMonth()).totalCommits;
  }
}
