import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [ConfigModule, HttpModule, CacheModule.register(), BlockchainModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
