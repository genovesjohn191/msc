import { ProductType } from '../enumerations/product-type.enum';
import { McsQueryParam } from './mcs-query-param';

export class McsObjectQueryParams extends McsQueryParam {
  public companyId?: string;
  public productType?: string;

  constructor() {
    super();
  }
}
