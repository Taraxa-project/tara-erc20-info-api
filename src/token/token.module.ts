import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [ConfigModule, CacheModule.register()],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
