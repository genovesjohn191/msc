import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsNetworkDbVlanQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'pod_name' })
  public podName?: string;

  @JsonProperty({ name: 'pod_site_name' })
  public podSiteName?: string;

  @JsonProperty({ name: 'network_company_id' })
  public networkCompanyId?: string;
}