import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

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
  public alternateId: string = undefined;

  @JsonProperty()
  public costCents: number = undefined;

  @JsonProperty()
  public billingTerm: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public commitmentEndDate: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public commitmentStartDate: Date = undefined;

  @JsonProperty()
  public autoRenewEnabled: boolean = undefined;
}
