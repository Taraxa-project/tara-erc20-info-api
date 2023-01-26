import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppController } from './app.controller';
import general from './config/general';
import { CronModule } from './cron/cron.module';
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
    CronModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
