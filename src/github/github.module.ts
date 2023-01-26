import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { GraphQLService } from './graphql.connector.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    CacheModule.register(),
    GraphQLRequestModule.forRootAsync(GraphQLRequestModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          endpoint: config.get<string>('graphQLGitHubURI'),
          options: {
            headers: {
              Authorization: `bearer ${config.get<string>(
                'githubAccessToken',
              )}`,
              'Content-Type': 'application/json',
            },
          },
        };
      },
    }),
  ],
  controllers: [GitHubController],
  providers: [GitHubService, GraphQLService],
})
export class GitHubModule {}
