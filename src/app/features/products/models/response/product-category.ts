import { JsonProperty } from 'json-object-mapper';
import { Product } from './product';

export class ProductCategory {
  public id: any;
  public name: string;

  @JsonProperty({ type: Product })
  public products: Product[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.products = undefined;
  }
}
