import { McsQueryParam } from './mcs-query-param';

export class McsServersQueryParams extends McsQueryParam {
  public storageProfile?: string;
  public expand?: boolean;

  constructor() {
    super();
    this.storageProfile = '';
    this.expand = false;
  }
}
