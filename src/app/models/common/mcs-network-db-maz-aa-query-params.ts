import { McsQueryParam } from './mcs-query-param';

export class McsNetworkDbMazAaQueryParams extends McsQueryParam {
  public podIds: number[];

  constructor() {
    super();
    this.podIds = [];
  }
}
