import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule } from '@nestjs/common';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { buildCacheConfig } from 'src/config/cacheConfig';
@Module({
  imports: [
    BlockchainModule,
    ConfigModule,
    HttpModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildCacheConfig(configService),
    }),
  ],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
