import {
  Controller,
  Get,
  CacheTTL,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GitHubService } from './github.service';

@ApiTags('Contributions')
@Controller('contributions')
export class GitHubController {
  constructor(private readonly ghService: GitHubService) {}

  @Get()
  @CacheTTL(36000)
  async contributionData() {
    const commitsThisMonth = (await this.ghService.commitsOfThisMonth())
      .totalCommits;
    return {
      commitsThisMonth,
    };
  }
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
