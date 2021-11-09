import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsAzureServicesRequestParams extends McsQueryParam {
  @JsonProperty({ name: 'tenant_id' })
  public tenantId?: string = undefined;
}
