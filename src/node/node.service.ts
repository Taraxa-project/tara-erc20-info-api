import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';

const WEEK_LENGTH = 604800000;

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async noActiveValidators(testnet?: boolean) {
    let delegationRoot;
    if (testnet) {
      delegationRoot = this.configService.get<string>(
        'testnetDelegationAPIRoot',
      );
    } else {
      delegationRoot = this.configService.get<string>('delegationAPIRoot');
    }
    const delegationApi = `${delegationRoot}/validators?show_fully_delegated=true&show_my_validators=false`;
    let delegationData;
    try {
      const realTimeDelegationData = await firstValueFrom(
        this.httpService
          .get(delegationApi)
          .pipe(
            catchError((error) => {
              this.logger.error(error);
              throw new ForbiddenException('API not available');
            }),
          )
          .pipe(
            map((res) => {
              return res.data;
            }),
          ),
      );
      delegationData = realTimeDelegationData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.',
      );
    }
    let totalActive = 0;
    delegationData.forEach((node: any) => {
      if (
        node.isActive ||
        new Date().getTime() - WEEK_LENGTH >
          new Date(node.lastBlockCreatedAt).getTime()
      ) {
        totalActive++;
      }
    });
    return {
      totalActive,
    };
  }
}
