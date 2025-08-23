import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { DposContract } from 'src/blockchain/dpos.contract';

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly dposContract: DposContract,
  ) {}

  async mainnetValidators(address?: string) {
    let validators = [];
    if (address) {
      validators = await this.dposContract.fetchDelegationDataFor(address);
    } else {
      validators = await this.dposContract.fetchDelegationData();
    }

    return validators.map((validator) => ({
      address: validator.account,
      owner: validator.info.owner,
      commission: +(
        parseFloat(`${validator.info.commission}` || '0') / 100
      ).toPrecision(2),
      commissionReward: validator.info.commission_reward.toString(),
      lastCommissionChange: validator.info.last_commission_change.toString(),
      delegation: validator.info.total_stake.toString(),
      description: validator.info.description,
      endpoint: validator.info.endpoint,
    }));
  }

  async mainnetValidator(address: string) {
    const validator = await this.dposContract.fetchValidator(address);
    return {
      address,
      owner: validator.owner,
      commission: +(
        parseFloat(`${validator.commission}` || '0') / 100
      ).toPrecision(2),
      commissionReward: validator.commission_reward.toString(),
      lastCommissionChange: validator.last_commission_change.toString(),
      delegation: validator.total_stake.toString(),
      description: validator.description,
      endpoint: validator.endpoint,
    };
  }

  async noActiveValidators(testnet?: boolean) {
    let indexerRoot: string;
    if (testnet) {
      indexerRoot = this.configService.get<string>('testnetIndexerRootUrl');
    } else {
      indexerRoot = this.configService.get<string>('mainnetIndexerRootUrl');
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

  // async cumulativeCommisson() {
  //   let cumulativeCommission = BigNumber.from(0);
  //   const validators = await this.dposContract.fetchDelegationData();
  //   validators.forEach((validator) => {
  //     cumulativeCommission = cumulativeCommission.add(
  //       BigNumber.from(validator.info.commission_reward),
  //     );
  //   });
  //   return ethers.utils.formatEther(cumulativeCommission.toString());
  // }
}
