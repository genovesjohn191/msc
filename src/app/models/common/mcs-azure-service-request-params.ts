import { McsQueryParam } from './mcs-query-param';

export class McsAzureServicesRequestParams extends McsQueryParam {
  public tenantId?: string;

  constructor() {
    super();
    this.tenantId = '';
  }
}
