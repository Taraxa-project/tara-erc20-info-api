import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, ethers } from 'ethers';
import { ValidatorData } from '../utils/types';

@Injectable()
export class DelegationService {
  private readonly logger = new Logger(DelegationService.name);
  private ethersProvider: ethers.providers.JsonRpcProvider;
  private dposContract: ethers.Contract;
  constructor(
    private configService: ConfigService,
  ) {
    this.ethersProvider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('taraProvider'),
    );

    this.dposContract = new ethers.Contract(
      this.configService.get<string>('dposAddress'),
      [
        'function getValidators(uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) info)[] validators, bool end)',
      ],
      this.ethersProvider,
    );
  }

  async totalDelegated() {
    const validators = await this.fetchDelegationData();

    const total = validators.reduce((acc, validator: ValidatorData) => {
      return acc.add(validator.info.total_stake);
    }, BigNumber.from(0));

    return total.div(BigNumber.from(10).pow(18)).toString();
  }

  async averageWeightedCommission() {
    const validators = await this.fetchDelegationData();
    let totalDelegation = validators.reduce((acc, validator: ValidatorData) => {
      return acc.add(validator.info.total_stake);
    }, BigNumber.from(0));

    let totalWeightedCommission = BigNumber.from(0);
    validators.forEach((node: ValidatorData) => {
      totalWeightedCommission = totalWeightedCommission.add(
        BigNumber.from(node.info.commission).mul(
          BigNumber.from(node.info.total_stake)
        ),
      );
    });

    const weightedAverage =
      parseFloat(totalWeightedCommission.toString()) /
      parseFloat(totalDelegation.toString());


    return {
      totalDelegated: totalDelegation,
      averageWeightedCommission: weightedAverage,
    };
  }

  private async fetchDelegationData(): Promise<ValidatorData[]> {
    let validators: ValidatorData[] = [];
    let isDone = false;
    let index = 0;
    while (!isDone) {
      const res: {
        validators: ValidatorData[];
        end: boolean;
      } = await this.dposContract.getValidators(index);
      validators = validators.concat(res.validators.map(v => ({
        account: v.account,
        info: {
          ...v.info,
          commission: parseFloat(v.info.commission.toString()) / 100,
        }
      })));
      isDone = res.end;
      index++;
    }
    return validators;
  }
}
