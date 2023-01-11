import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import general from './config/general';
import { StakingModule } from './staking/staking.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [general],
    }),
    TokenModule,
    StakingModule,
  ],
})
export class AppModule {}
