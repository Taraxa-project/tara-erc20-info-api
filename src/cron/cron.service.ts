import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class CacheRefresherService {
  private readonly logger = new Logger(CacheRefresherService.name);
  private rootUri = '';
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.rootUri = configService.get<string>('apiRoot');
    this.logger.log('Cron Service initialized');
  }

  @Cron('59 */9 * * *')
  async handleLongCacheUpdates() {
    this.logger.debug('Refreshing cache');
    const routes = await this.getRoutes();
    this.logger.debug(routes);
    for (const route of routes) {
      if (
        route &&
        (route.includes('staking') ||
          route.includes('token') ||
          route.includes('contributions') ||
          route.includes('validators'))
      ) {
        const data = await this.get(`${this.rootUri}${route}`);
        if (data) {
          this.logger.log(
            `Refreshed ${route} endpoint. New return data is: ${data}`,
          );
        }
      }
    }
  }

  async getRoutes(): Promise<string[]> {
    const routeData = await this.get(`${this.rootUri}/app`);
    return routeData?.map((routeInformation) => {
      return routeInformation?.route?.path;
    });
  }

  async get(uri: string): Promise<any> {
    const res = firstValueFrom(
      this.httpService.get(uri).pipe(
        map((res) => {
          //   console.log(res);
          return res.data;
        }),
        catchError((err) => {
          this.logger.error(err);
          throw new ForbiddenException('API not available');
        }),
      ),
    );
    return res;
  }
}
