import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsPerpetualSoftware extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public quantity: number = undefined;

  @JsonProperty()
  public offerId: string = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;
}
