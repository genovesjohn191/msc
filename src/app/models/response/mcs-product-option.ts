import { JsonProperty } from '@peerlancers/json-serialization';
import { McsProductOptionProperty } from './mcs-product-option-property';

export class McsProductOption {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public displayOrder: string = undefined;

  @JsonProperty()
  public listOptions: string[] = undefined;

  @JsonProperty({ target: McsProductOptionProperty })
  public properties: McsProductOptionProperty[] = undefined;
}
