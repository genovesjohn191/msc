import { CatalogType } from './catalog-type';

export class CatalogItem<T> {
  public type: CatalogType;
  public content: T;
}
