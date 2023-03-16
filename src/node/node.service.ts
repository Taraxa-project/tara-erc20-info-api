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
    let indexerRoot: string;
    if (testnet) {
      indexerRoot = this.configService.get<string>('testnetIndexerRoot');
    } else {
      indexerRoot = this.configService.get<string>('indexerRoot');
    }
    const explorerApi = `${indexerRoot}/validators?start=0&limit=100`;
    let activeNodeNumber = 0;
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      const realTimeDelegationData = await firstValueFrom(
        this.httpService.get(explorerApi, { headers }).pipe(
          map((res) => {
            return res.data.total;
          }),
          catchError((error) => {
            this.logger.error(error);
            throw new ForbiddenException('API not available');
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
    let index = 0;
    try {
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
          cumulativeCommission = cumulativeCommission.add(
            BigNumber.from(validator.info.commission_reward),
          );
        });
      }
    } catch (error) {
      this.logger.error(`Fetching DPOS Contract data failed ${error}`);
      throw new InternalServerErrorException(
        'Fetching DPOS Contract data failed. Please try again later!',
      );
    }
    return ethers.utils.formatEther(cumulativeCommission.toString());
  }
}
