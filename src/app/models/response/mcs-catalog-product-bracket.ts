import { JsonProperty } from '@app/utilities';
import { McsCatalogProductPlatform } from './mcs-catalog-product-platform';

export class McsCatalogProductBracket {
  @JsonProperty({ target: McsCatalogProductPlatform })
  public platforms: McsCatalogProductPlatform[] = undefined;
}
