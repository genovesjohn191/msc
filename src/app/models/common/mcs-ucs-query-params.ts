import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsUcsQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'management_name' })
  public managementName?: string;
  
  @JsonProperty({ name: 'availability_zone' })
  public availabilityZone?: string;
  
  @JsonProperty({ name: 'pod_name' })
  public podName?: string;
  
  @JsonProperty({ name: 'domain_group_name' })
  public domainGroupName?: string;
}
