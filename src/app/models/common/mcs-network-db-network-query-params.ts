import { McsQueryParam } from './mcs-query-param';

export class McsNetworkDbNetworkQueryParams extends McsQueryParam {
  public companyId?: string;
  public name?: string;

  constructor() {
    super();
    this.companyId = '';
    this.name = '';
  }
}
