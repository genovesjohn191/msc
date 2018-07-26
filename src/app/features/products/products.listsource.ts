import {
  Observable,
  merge,
  of
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsListSourceBase,
  McsSearch,
  McsKeyValuePair
} from '../../core';
import {
  compareStrings,
  containsString,
  isNullOrEmpty
} from '../../utilities';
import {
  ProductCatalog,
  Product,
  ProductCategory
} from './models';
import { ProductCatalogRepository } from './product-catalog.repository';

export class ProductCatalogListSource extends McsListSourceBase<ProductCatalog> {

  constructor(
    private _catalogRepository: ProductCatalogRepository,
    private _search: McsSearch) {
    super();
  }

  /**
   * Catalog group sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public catalogGroupSortMethod(first: McsKeyValuePair, second: McsKeyValuePair): number {
    return compareStrings(first.key, second.key);
  }

  /**
   * Catalog sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public catalogSortMethod(first: ProductCatalog, second: ProductCatalog): number {
    return compareStrings(first.name, second.name);
  }

  /**
   * Streams to be considered when to get/find all the records from listing
   */
  protected getStreams(): Observable<any> {
    const dataStreams = [
      of(undefined),
      this._search.searchChangedStream,
    ];
    return merge(...dataStreams);
  }

  /**
   * Get all records from repository
   */
  protected getAllRecords(): Observable<ProductCatalog[]> {
    return this._catalogRepository.findAllRecords()
      .pipe(
        map((response) => {
          let filteredCatalog: ProductCatalog[] = [];
          response.forEach((catalog) => {
            let filteredItems = this._filterByCatalog(this._search.keyword, catalog);
            if (!isNullOrEmpty(filteredItems)) { filteredCatalog.push(filteredItems); }
          });
          return filteredCatalog;
        })
      );
  }

  /**
   * Filter all record from repository based on its source catalog and keyword
   */
  private _filterByCatalog(keyword: string, sourceCatalog: ProductCatalog): ProductCatalog {
    if (isNullOrEmpty(sourceCatalog)) { return undefined; }
    let _catalog = Object.assign({}, sourceCatalog);

    // Return the whole catalog when the name is the found
    if (containsString(sourceCatalog.name, keyword)) { return _catalog; }

    _catalog.categories = [];
    sourceCatalog.categories.forEach((category) => {
      let filteredCategory = this._filterByCategory(keyword, category);
      if (isNullOrEmpty(filteredCategory)) { return; }
      _catalog.categories.push(filteredCategory);
    });
    return isNullOrEmpty(_catalog.categories) ? undefined : _catalog;
  }

  /**
   * Filter all record from repository based on its source category and keyword
   */
  private _filterByCategory(keyword: string, sourceCategory: ProductCategory): ProductCategory {
    if (isNullOrEmpty(sourceCategory)) { return undefined; }
    let targetCategory = Object.assign({}, sourceCategory);

    // Return the whole category when the name is the found
    if (containsString(sourceCategory.name, keyword)) { return targetCategory; }

    targetCategory.products = this._filterByProducts(keyword, sourceCategory.products);
    return isNullOrEmpty(targetCategory.products) ? undefined : targetCategory;
  }

  /**
   * Filter all record from repository based on its source products and keyword
   */
  private _filterByProducts(keyword: string, sourceProducts: Product[]): Product[] {
    if (isNullOrEmpty(sourceProducts)) { return undefined; }
    return sourceProducts.filter((product) => containsString(product.name, keyword));
  }
}
