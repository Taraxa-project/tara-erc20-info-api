import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, ethers } from 'ethers';
import { catchError, firstValueFrom, map } from 'rxjs';
import getWeek from 'src/utils/date';
import { ValidatorData } from 'src/utils/types';
import * as Dpos from './contracts/Dpos.json';

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  private ethersProvider: ethers.providers.JsonRpcProvider;
  private dposContract: ethers.Contract;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.ethersProvider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('taraProvider'),
    );

    this.dposContract = new ethers.Contract(
      this.configService.get<string>('dposAddress'),
      Dpos,
      this.ethersProvider,
    );
  }

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

  async cumulativeCommisson() {
    let isDone = false;
    let cumulativeCommission = BigNumber.from(0);
    let index = 100;
    while (!isDone) {
      const res: {
        validators: ValidatorData[];
        end: boolean;
      } = await this.dposContract.getValidators(index);
      if (res.end) {
        isDone = true;
      } else {
        index += 100;
      }
      res.validators.forEach((validator) => {
        this.logger.log(`Scanning validator ${validator.account}`);
        cumulativeCommission = cumulativeCommission.add(
          BigNumber.from(validator.info.commission_reward),
        );
      });
    }
    return cumulativeCommission.toString();
  }
}
