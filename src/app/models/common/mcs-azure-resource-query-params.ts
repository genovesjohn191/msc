import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsAzureResourceQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'tag_name' })
  public tagName?: string = undefined;

  @JsonProperty({ name: 'tag_value' })
  public tagValue?: string = undefined;

  @JsonProperty({ name: 'subscription_id' })
  public subscriptionId?: string = undefined;

  @JsonProperty({ name: 'type' })
  public type?: string = undefined;
}
