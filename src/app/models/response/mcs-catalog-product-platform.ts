import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsCatalogProductFamily } from './mcs-catalog-product-family';

export class McsCatalogProductPlatform extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty({ target: McsCatalogProductFamily })
  public families: McsCatalogProductFamily[] = undefined;
}
