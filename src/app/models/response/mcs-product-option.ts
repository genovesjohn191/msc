import { JsonProperty } from 'json-object-mapper';
import { McsProductOptionProperty } from './mcs-product-option-property';

export class McsProductOption {
  public name: string;
  public type: string;
  public displayOrder: string;
  public listOptions: string[];

  @JsonProperty({ type: McsProductOptionProperty })
  public properties: McsProductOptionProperty[];

  constructor() {
    this.name = undefined;
    this.type = undefined;
    this.displayOrder = undefined;
    this.listOptions = undefined;
    this.properties = undefined;
  }
}
