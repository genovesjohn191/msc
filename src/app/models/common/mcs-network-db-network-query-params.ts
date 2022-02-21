import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsNetworkDbNetworkQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'company_id' })
  public companyId?: string;

  @JsonProperty({ name: 'name' })
  public name?: string;
}
