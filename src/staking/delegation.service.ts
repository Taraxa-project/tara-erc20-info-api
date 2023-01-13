import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber } from 'ethers';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class DelegationService {
  private readonly logger = new Logger(DelegationService.name);
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async totalDelegated() {
    const delegationData = await this.fetchDelegationData();

    let totalDelegationAcc = 0;
    delegationData.forEach((node: any) => {
      if (node.totalDelegation) {
        totalDelegationAcc += node.totalDelegation;
      }
    });
    return {
      totalDelegated: totalDelegationAcc,
    };
  }

  async averageWeightedCommission() {
    const delegationData = await this.fetchDelegationData();
    let totalDelegationAcc = 0;
    delegationData?.forEach((node: any) => {
      if (node.totalDelegation) {
        totalDelegationAcc += node.totalDelegation;
      }
    });
    let totalWeightedCommission = BigNumber.from(0);
    delegationData?.forEach((node: any) => {
      if (node.totalDelegation && node.currentCommission) {
        totalWeightedCommission = totalWeightedCommission.add(
          BigNumber.from(node.currentCommission).mul(
            BigNumber.from(node.totalDelegation),
          ),
        );
      }
    });
    const weightedAverage = totalWeightedCommission.div(totalDelegationAcc);
    return {
      totalDelegated: totalDelegationAcc,
      averageWeightedCommission: weightedAverage.toString(),
    };
  }

  private async fetchDelegationData() {
    const delegationApi = `${this.configService.get<string>(
      'delegationAPIRoot',
    )}/validators?show_fully_delegated=true&show_my_validators=false`;
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      const realTimeDelegationData = await firstValueFrom(
        this.httpService.get(delegationApi, { headers }).pipe(
          map((res) => {
            return res.data;
          }),
          catchError((error) => {
            this.logger.error(`Error calling Delegation API: ${error}`);
            throw new ForbiddenException('API not available');
          }),
        ),
      );
      return realTimeDelegationData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching delegation details failed. Please try again later!',
      );
    }
  }
}
