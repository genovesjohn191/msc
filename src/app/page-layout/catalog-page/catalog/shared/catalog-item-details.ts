import { CatalogViewType } from '@app/models';

import { CatalogHeader } from './catalog-header';
import { CatalogType } from './catalog-type';

export class CatalogItemDetails {
  catalogViewType: CatalogViewType;
  catalogType: CatalogType;
  platformType?: string;
  id?: string;
  data?: any; // This can be solution or product
  header: CatalogHeader;

  public get isForProductView(): boolean {
    return this.catalogViewType === CatalogViewType.Product;
  }

  public get isForSolutionView(): boolean {
    return this.catalogViewType === CatalogViewType.Solution;
  }

  public get isForDetailView(): boolean {
    return this.isForProductView || this.isForSolutionView;
  }
}
