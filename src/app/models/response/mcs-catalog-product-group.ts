import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsCatalogProduct } from './mcs-catalog-product';

export class McsCatalogProductGroup extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty({ target: McsCatalogProduct })
  public products: McsCatalogProduct[] = undefined;
}
