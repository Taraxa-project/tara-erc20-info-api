import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
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
    SwaggerModule,
    TokenModule,
    StakingModule,
    NodeModule,
    GitHubModule,
  ],
})
export class AppModule {}
