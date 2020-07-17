import { JsonProperty } from '@app/utilities';
import {
  DeliveryType,
  DeliveryTypeSerialization
} from '../enumerations/delivery-type.enum';

export class McsOrderItemCreate {
  @JsonProperty()
  public serviceId?: string = undefined;

  @JsonProperty()
  public itemOrderType?: string = undefined;

  @JsonProperty()
  public referenceId?: string = undefined;

  @JsonProperty()
  public parentServiceId?: string = undefined;

  @JsonProperty()
  public parentReferenceId?: string = undefined;

  @JsonProperty({
    serializer: DeliveryTypeSerialization,
    deserializer: DeliveryTypeSerialization
  })
  public deliveryType?: DeliveryType = undefined;

  @JsonProperty()
  public properties?: any = undefined;
}
