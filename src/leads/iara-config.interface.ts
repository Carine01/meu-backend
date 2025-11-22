import { InjectionToken } from '@nestjs/common';

export interface IaraConfig {
  edgeUrl: string;
  secret: string;
  defaultClinic: string;
  defaultOrigem: string;
}

export const IARA_CONFIG_TOKEN: InjectionToken = 'IARA_CONFIG_TOKEN';

