import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AzureModule {
  AzureDiscover,
  AzureDesign,
  AzurePrepare,
  AzureDeploy,
  AzureInnovate,
  AzureOptimise,
  AzureSecure,
  AzureGovern,
}

export const azureModuleText = {
  [AzureModule.AzureDiscover]: 'Azure Discover',
  [AzureModule.AzureDesign]: 'Azure Design',
  [AzureModule.AzurePrepare]: 'Azure Prepare',
  [AzureModule.AzureDeploy]: 'Azure Deploy',
  [AzureModule.AzureInnovate]: 'Azure Innovate',
  [AzureModule.AzureOptimise]: 'Azure Optimise',
  [AzureModule.AzureSecure]: 'Azure Secure',
  [AzureModule.AzureGovern]: 'Azure Govern',
}

export class AzureModuleSerialization
  extends McsEnumSerializationBase<AzureModule> {
  constructor() { super(AzureModule); }
}