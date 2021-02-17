import { CatalogItemDetails } from '../catalog-item-details';

export interface IExportDocument {
  exportDocument(itemDetails: CatalogItemDetails): void;
}
