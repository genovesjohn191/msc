import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsManagementServiceQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'product_type' })
  public productType?: string = undefined;
}