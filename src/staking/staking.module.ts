import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { TokenModule } from 'src/token/token.module';
import { DelegationService } from './delegation.service';
import { StakingController } from './staking.controller';

@Module({
  imports: [
    ConfigModule,
    TokenModule,
    CacheModule.register(),
    BlockchainModule,
  ],
  controllers: [StakingController],
  providers: [DelegationService],
})
export class StakingModule {}
