import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';

@Module({
  imports: [ConfigModule, HttpModule, CacheModule.register(), BlockchainModule],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
