import { McsQueryParam } from './mcs-query-param';

export class McsReservationProductTypeQueryParams extends McsQueryParam {
  public skuId?: string;
  public productId?: string;

  constructor() {
    super();
    this.skuId = '';
    this.productId = '';
  }
}
