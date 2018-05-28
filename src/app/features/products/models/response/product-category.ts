import { JsonProperty } from 'json-object-mapper';
import { Product } from './product';
import { McsEntityBase } from '../../../../core';

export class ProductCategory extends McsEntityBase {
  public name: string;

  @JsonProperty({ type: Product })
  public products: Product[];

  constructor() {
    super();
    this.name = undefined;
    this.products = undefined;
  }
}
