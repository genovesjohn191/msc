import { McsQueryParam } from './mcs-query-param';

export class McsAzureDeploymentsQueryParams extends McsQueryParam {
  public companyId?: string;
  public name?: string;

  constructor() {
    super();
  }
}
