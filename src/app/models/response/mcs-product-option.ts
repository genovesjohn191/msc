import { JsonProperty } from 'json-object-mapper';
import { McsProductSelectOption } from './mcs-product-select-option';

export class McsProductOption {
  public name: string;
  public type: string;
  public displayOrder: string;
  public maxQuantity: string;
  public minQuantity: string;

  @JsonProperty({ type: McsProductSelectOption })
  public selectOptions: McsProductSelectOption;

  constructor() {
    this.name = undefined;
    this.type = undefined;
    this.displayOrder = undefined;
    this.maxQuantity = undefined;
    this.minQuantity = undefined;
    this.selectOptions = undefined;
  }
}
