import { JsonProperty } from 'json-object-mapper';
import { ProductDownload } from './product-download';
import { ProductDependency } from './product-dependency';

export class Product {
  public id: any;
  public name: string;
  public url: string;
  public catalog: string;
  public category: string;
  public pciCompliance: string;
  public useCases: string;
  public description: string;

  @JsonProperty({ type: ProductDownload })
  public downloads: ProductDownload[];

  @JsonProperty({ type: ProductDependency })
  public dependencies: ProductDependency[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.url = undefined;
    this.catalog = undefined;
    this.category = undefined;
    this.pciCompliance = undefined;
    this.useCases = undefined;
    this.description = undefined;
    this.downloads = undefined;
    this.dependencies = undefined;
  }
}
