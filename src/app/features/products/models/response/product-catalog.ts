import { JsonProperty } from 'json-object-mapper';
import { ProductCategory } from './product-category';

export class ProductCatalog {
  public id: any;
  public name: string;

  @JsonProperty({ type: ProductCategory })
  public categories: ProductCategory[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.categories = undefined;
  }
}
