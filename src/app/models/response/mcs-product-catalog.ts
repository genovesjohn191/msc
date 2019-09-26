import { JsonProperty } from '@peerlancers/json-serialization';
import { McsProductCategory } from './mcs-product-category';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsProductCatalog extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty({ target: McsProductCategory })
  public categories: McsProductCategory[] = undefined;
}
