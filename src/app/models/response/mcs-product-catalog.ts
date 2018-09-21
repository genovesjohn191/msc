import { JsonProperty } from 'json-object-mapper';
import { McsProductCategory } from './mcs-product-category';
import { McsEntityBase } from '../mcs-entity.base';

export class McsProductCatalog extends McsEntityBase {
  public name: string;
  public displayOrder: number;

  @JsonProperty({ type: McsProductCategory })
  public categories: McsProductCategory[];

  constructor() {
    super();
    this.name = undefined;
    this.displayOrder = undefined;
    this.categories = undefined;
  }
}
