import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from 'src/token/token.module';
import { DelegationService } from './delegation.service';
import { StakingController } from './staking.controller';

@Module({
  imports: [ConfigModule, TokenModule, CacheModule.register()],
  controllers: [StakingController],
  providers: [DelegationService],
})
export class StakingModule {}
