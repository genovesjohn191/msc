import { ServerCatalogType } from '../enumerations/server-catalog-type.enum';
import { ServerCatalogItemType } from '../enumerations/server-catalog-item-type.enum';

export class ServerCatalog {
  public id: any;
  public name: string;
  public type: ServerCatalogType;
  public itemType: ServerCatalogItemType;
  public itemName: string;
}
