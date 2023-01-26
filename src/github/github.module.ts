import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule, CacheStore } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { GraphQLService } from './graphql.connector.service';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          store: await redisStore({
            socket: {
              host: configService.get<string>('redisHost'),
              port: configService.get<number>('redisPort'),
            },
            name: `${configService.get<string>(
              'namePrefix',
            )}_${configService.get<string>('redisName')}`,
          }),
        } as unknown as CacheStore;
      },
    }),
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
