import { CacheModule, Module } from '@nestjs/common';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DelegationService } from './delegation.service';
import { StakingController } from './staking.controller';
import { buildCacheConfig } from 'src/config/cacheConfig';

@Module({
  imports: [
    ConfigModule,
    BlockchainModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildCacheConfig(configService),
    }),
  ],
  controllers: [StakingController],
  providers: [DelegationService],
  exports: [DelegationService],
})
export class StakingModule {}
