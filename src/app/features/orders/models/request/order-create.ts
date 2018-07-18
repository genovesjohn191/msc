import { JsonProperty } from 'json-object-mapper';
import { OrderItemCreate } from './order-item-create';

export class OrderCreate {
  public description: string;
  public contractDuration: number;

  @JsonProperty({ type: OrderItemCreate })
  public items: OrderItemCreate[];

  constructor() {
    this.description = undefined;
    this.contractDuration = undefined;
    this.items = undefined;
  }
}
