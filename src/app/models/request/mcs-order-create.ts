import { JsonProperty } from 'json-object-mapper';
import { McsOrderItemCreate } from './mcs-order-item-create';

export class McsOrderCreate {
  public description?: string;
  public contractDurationMonths?: number;
  public billingSiteId?: string;
  public costCentreId?: string;

  @JsonProperty({ type: McsOrderItemCreate })
  public items?: McsOrderItemCreate[];

  constructor() {
    this.description = undefined;
    this.contractDurationMonths = undefined;
    this.items = [];
    this.billingSiteId = undefined;
    this.costCentreId = undefined;
  }
}
