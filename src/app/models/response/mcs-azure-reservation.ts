import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsAzureReservation extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public productName: string = undefined;

  @JsonProperty()
  public quantity: number = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public reservationType: string = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public billingFrequency: string = undefined;

  @JsonProperty()
  public billingTerm: string = undefined;

  @JsonProperty()
  public scope: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public reservationOrderId: string = undefined;

  @JsonProperty()
  public provisioningId: string = undefined;
}
