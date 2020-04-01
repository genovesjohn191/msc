import { JsonProperty } from '@peerlancers/json-serialization';
import { McsCatalogProductPlatform } from './mcs-catalog-product-platform';

export class McsCatalogProductBracket {
  @JsonProperty({ target: McsCatalogProductPlatform })
  public platforms: McsCatalogProductPlatform[] = undefined;
}
