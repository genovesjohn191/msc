import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsAzureSoftwareSubscription extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public quantity: number = undefined;

  @JsonProperty()
  public offerId: string = undefined;

  @JsonProperty()
  public alternativeId: string = undefined;

  @JsonProperty()
  public costCents: number = undefined;

  @JsonProperty()
  public billingTerm: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;
}
