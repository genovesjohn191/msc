import { JsonProperty } from 'json-object-mapper';
import { McsProduct } from './mcs-product';
import { McsEntityBase } from '../mcs-entity.base';

export class McsProductCategory extends McsEntityBase {
  public name: string;
  public displayOrder: number;

  @JsonProperty({ type: McsProduct })
  public products: McsProduct[];

  constructor() {
    super();
    this.name = undefined;
    this.displayOrder = undefined;
    this.products = undefined;
  }
}
