import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import getWeek from 'src/utils/date';

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async noActiveValidators(testnet?: boolean) {
    let explorerRoot;
    if (testnet) {
      explorerRoot = this.configService.get<string>('testnetExplorerRoot');
    } else {
      explorerRoot = this.configService.get<string>('explorerRoot');
    }
    const explorerApi = `${explorerRoot}/api/nodes?week=${getWeek(
      1,
    )}&year=${new Date().getUTCFullYear()}`;
    this.logger.log(explorerApi);
    let activeNodeNumber;
    try {
      const realTimeDelegationData = await firstValueFrom(
        this.httpService
          .get(explorerApi)
          .pipe(
            catchError((error) => {
              this.logger.error(error);
              throw new ForbiddenException('API not available');
            }),
          )
          .pipe(
            map((res) => {
              this.logger.log(res.data);
              return res.data.total;
            }),
          ),
      );
      activeNodeNumber = realTimeDelegationData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.',
      );
    }
    return {
      totalActive: activeNodeNumber,
    };
  }
}
