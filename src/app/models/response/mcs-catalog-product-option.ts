import { JsonProperty } from '@app/utilities';
import { McsCatalogProductOptionProperty } from './mcs-catalog-product-option-property';

export class McsCatalogProductOption {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty()
  public listOptions: string[] = undefined;

  @JsonProperty({ target: McsCatalogProductOptionProperty })
  public properties: McsCatalogProductOptionProperty[] = undefined;
}
