import { JsonProperty } from 'json-object-mapper';
import { McsOrderItemCreate } from './mcs-order-item-create';

export class McsOrderCreate {
  public description: string;
  public contractDuration: number;
  public billingSite: string;
  public costCentre: string;

  @JsonProperty({ type: McsOrderItemCreate })
  public items: McsOrderItemCreate[];

  constructor() {
    this.description = undefined;
    this.contractDuration = undefined;
    this.items = [];
    this.billingSite = undefined;
    this.costCentre = undefined;
  }
}
