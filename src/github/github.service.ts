import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLService } from './graphql.connector.service';

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  constructor(
    private configService: ConfigService,
    private readonly graphQLService: GraphQLService,
  ) {}

  async getRepoNames() {
    let returnData;
    let endCursor;
    const repoNames = [];
    let isDone = false;
    while (!isDone) {
      try {
        const token = this.configService.get<string>('githubAccessToken');
        this.logger.log(token);
        returnData = await this.graphQLService.getRepoNames(endCursor);
      } catch (error) {
        this.logger.error(error);
        throw new InternalServerErrorException(
          'Fetching details unsuccessful. Please try again later.',
        );
      }
      returnData.organization.repositories.edges.forEach((edge) => {
        if (!edge.node.isArchived) {
          repoNames.push(edge.node.name);
        }
      });
      if (returnData.organization.repositories.pageInfo.hasNextPage === true) {
        endCursor = returnData.organization.repositories.pageInfo.endCursor;
      } else {
        isDone = true;
      }
    }
    return repoNames;
  }

  async commitsOfThisMonth() {
    const repoNames = await this.getRepoNames();
    let totalCommits = 0;
    for (const repo of repoNames) {
      this.logger.warn(`Scanning commits for repo ${repo}`);
      let returnData;
      let endCursor;
      let isDone = false;
      while (!isDone) {
        try {
          const token = this.configService.get<string>('githubAccessToken');
          this.logger.log(token);
          const since = new Date(
            new Date().getUTCFullYear(),
            new Date().getMonth(),
            1,
            0,
            0,
            0,
            0,
          );
          returnData = await this.graphQLService.getRepoCommitsSince(
            repo,
            since,
            endCursor,
          );
        } catch (error) {
          this.logger.error(error);
          throw new InternalServerErrorException(
            'Fetching details unsuccessful. Please try again later.',
          );
        }
        returnData.repository.refs.edges.forEach((edge) => {
          if (!edge.node.name?.includes('dependabot')) {
            totalCommits += Number(edge.node.target.history.totalCount || 0);
          }
        });
        if (returnData.repository.refs.pageInfo.hasNextPage === true) {
          endCursor = returnData.repository.refs.pageInfo.endCursor;
        } else {
          isDone = true;
        }
      }
    }
    return {
      totalCommits,
    };
  }
}
