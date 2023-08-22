import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BigNumber } from 'ethers';
import { DposContract } from '../blockchain/dpos.contract';
import { ValidatorData, ValidatorWithYield } from '../utils/types';
import { Decimal } from 'decimal.js';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class StakingService {
  private readonly logger: Logger = new Logger(StakingService.name);
  constructor(
    private readonly dposContract: DposContract,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async totalDelegated() {
    const validators = await this.dposContract.fetchDelegationData();

    const total = validators.reduce((acc, validator: ValidatorData) => {
      return acc.add(validator.info.total_stake);
    }, BigNumber.from(0));

    return total.div(BigNumber.from(10).pow(18)).toString();
  }

  async averageWeightedCommission() {
    const validators = await this.dposContract.fetchDelegationData();
    const totalDelegation = validators.reduce(
      (acc, validator: ValidatorData) => {
        return acc.add(validator.info.total_stake);
      },
      BigNumber.from(0),
    );

    let totalWeightedCommission = BigNumber.from(0);
    validators.forEach((node: ValidatorData) => {
      totalWeightedCommission = totalWeightedCommission.add(
        BigNumber.from(node.info.commission).mul(
          BigNumber.from(node.info.total_stake),
        ),
      );
    });

    const weightedAverage = new Decimal(totalWeightedCommission.toString())
      .div(new Decimal(totalDelegation.toString()))
      .div(new Decimal(100))
      .toString();

    return {
      totalDelegated: totalDelegation,
      averageWeightedCommission: weightedAverage,
    };
  }

  async averageStakingYield() {
    const indexerRoot = this.configService.get<string>('mainnetIndexerRootUrl');
    let start = 0;
    let hasNextPage = true;
    const allValidators: ValidatorWithYield[] = [];
    while (hasNextPage) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip,deflate,compress',
        };
        const response = await firstValueFrom(
          this.httpService
            .get(`${indexerRoot}/validators?limit=100&start=${start}`, {
              headers,
            })
            .pipe(
              map((res) => {
                return res;
              }),
              catchError((error) => {
                this.logger.error(error);
                throw new ForbiddenException('API not available');
              }),
            ),
        );
        if (response.status === 200) {
          const { data } = response;
          const { hasNext, data: validatorData } = data;
          allValidators.push(...validatorData);
          hasNextPage = hasNext;
          start += 100;
        }
      } catch (error) {
        this.logger.error(error);
        throw new InternalServerErrorException(
          'Fetching details unsuccessful. Please try again later.',
        );
      }
    }
    const yields = allValidators
      .filter((obj) => obj.yield !== undefined)
      .map((v) => v.yield * 100);
    const sum = yields.reduce((total, num) => total + num, 0);
    const average = sum / allValidators.length;
    return { average };
  }
}
