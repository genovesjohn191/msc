import { JsonProperty } from '@peerlancers/json-serialization';
import { McsProduct } from './mcs-product';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsProductCategory extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty({ target: McsProduct })
  public products: McsProduct[] = undefined;
}
