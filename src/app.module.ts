import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import general from './config/general';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [general],
    }),
    TokenModule,
  ],
})
export class AppModule {}
