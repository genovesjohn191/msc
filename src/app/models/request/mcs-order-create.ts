import { JsonProperty } from 'json-object-mapper';
import { McsOrderItemCreate } from './mcs-order-item-create';

export class McsOrderCreate {
  public description?: string = undefined;
  public contractDurationMonths?: number = undefined;
  public billingEntityId?: number = undefined;
  public billingSiteId?: number = undefined;
  public billingCostCentreId?: number = undefined;

  @JsonProperty({ type: McsOrderItemCreate })
  public items?: McsOrderItemCreate[] = [];
}
