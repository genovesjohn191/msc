import { JsonProperty } from 'json-object-mapper';
import { Product } from './product';
import { McsEntityBase } from '../../../../core';

export class ProductCategory extends McsEntityBase {
  public name: string;
  public displayOrder: number;

  @JsonProperty({ type: Product })
  public products: Product[];

  constructor() {
    super();
    this.name = undefined;
    this.displayOrder = undefined;
    this.products = undefined;
  }
}
