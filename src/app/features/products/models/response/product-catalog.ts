import { JsonProperty } from 'json-object-mapper';
import { ProductCategory } from './product-category';
import { McsEntityBase } from '../../../../core';

export class ProductCatalog extends McsEntityBase {
  public name: string;

  @JsonProperty({ type: ProductCategory })
  public categories: ProductCategory[];

  constructor() {
    super();
    this.name = undefined;
    this.categories = undefined;
  }
}
