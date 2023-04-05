import { CacheModule, CacheStore, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { redisStore } from 'cache-manager-redis-store';
import { BlockchainModule } from './blockchain/blockchain.module';
import general from './config/general';
import { GitHubModule } from './github/github.module';
import { NodeModule } from './node/node.module';
import { StakingModule } from './staking/staking.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [general],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          store: await redisStore({
            socket: {
              host: configService.get<string>('redisHost'),
              port: configService.get<number>('redisPort'),
            },
            password: configService.get<string>('redisPassword'),
          }),
        } as unknown as CacheStore;
      },
    }),
    SwaggerModule,
    TokenModule,
    StakingModule,
    NodeModule,
    GitHubModule,
    BlockchainModule,
  ],
})
export class AppModule {}
