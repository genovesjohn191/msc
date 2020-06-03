import { JsonProperty } from '@app/utilities';
import { McsCatalogProductInviewThreshold } from './mcs-catalog-product-inview-threshold';

export class McsCatalogProductInview {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public graphUrl: string = undefined;

  @JsonProperty({ target: McsCatalogProductInviewThreshold })
  public thresholds: McsCatalogProductInviewThreshold[] = undefined;
}
