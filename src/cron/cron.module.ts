import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheRefresherService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, HttpModule],
  providers: [CacheRefresherService],
})
export class CronModule {}
