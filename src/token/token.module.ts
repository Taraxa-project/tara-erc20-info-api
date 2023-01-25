import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule, CacheStore } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          store: await redisStore({
            socket: {
              host: configService.get<string>('redisHost'),
              port: configService.get<number>('redisPort'),
            },
            name: `${configService.get<string>(
              'namePrefix',
            )}_${configService.get<string>('redisName')}`,
          }),
        } as unknown as CacheStore;
      },
    }),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
