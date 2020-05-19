import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsLicense extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public offerId: string = undefined;

  @JsonProperty()
  public unit: string = undefined;

  @JsonProperty()
  public quantity: number = 0;

  @JsonProperty()
  public billingCycle: string = undefined;

  @JsonProperty()
  public parentId: string = undefined;

  @JsonProperty()
  public parentServiceId: string = undefined;

  @JsonProperty()
  public pcSubscriptionId: string = undefined;
}
