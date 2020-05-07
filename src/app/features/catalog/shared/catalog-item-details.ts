import { CatalogViewType } from '@app/models';
import { CatalogType } from './catalog-type';
import { CatalogHeader } from './catalog-header';

export class CatalogItemDetails {
  catalogViewType: CatalogViewType;
  catalogType: CatalogType;
  platformType?: string;
  id?: string;
  header: CatalogHeader;
}
