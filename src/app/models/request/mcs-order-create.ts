import { JsonProperty } from '@peerlancers/json-serialization';
import { McsOrderItemCreate } from './mcs-order-item-create';

export class McsOrderCreate {
  @JsonProperty()
  public description?: string = undefined;

  @JsonProperty()
  public contractDurationMonths?: number = undefined;

  @JsonProperty()
  public billingEntityId?: number = undefined;

  @JsonProperty()
  public billingSiteId?: number = undefined;

  @JsonProperty()
  public billingCostCentreId?: number = undefined;

  @JsonProperty({ target: McsOrderItemCreate })
  public items?: McsOrderItemCreate[] = [];
}
