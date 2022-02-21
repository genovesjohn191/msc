import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsAzureDeploymentsQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'company_id' })
  public companyId?: string = undefined;

  @JsonProperty({ name: 'name' })
  public name?: string = undefined;
}
