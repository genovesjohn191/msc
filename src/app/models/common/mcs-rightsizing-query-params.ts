import { McsQueryParam } from './mcs-query-param';

export class McsRightSizingQueryParams extends McsQueryParam {
  public periodStart?: string;
  public periodEnd?: string;

  constructor() {
    super();
    this.periodStart = '';
    this.periodEnd = '';
  }
}