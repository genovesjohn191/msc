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
  isNullOrEmpty,
  createNewObject
} from '../../utilities';
import { ProductCatalog } from './models';
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
          // Create new object of response so that we won't touch the original object
          let newObject = createNewObject<ProductCatalog[]>(ProductCatalog, response);
          return newObject.filter(this._filterCatalog.bind(this));
        })
      );
  }

  /**
   * Filters the catalog items going to products and return true
   * when the record in under the catalog
   * @param _sourceCatalog Source catalog from which the record should be filtered
   */
  private _filterCatalog(_sourceCatalog: ProductCatalog): boolean {
    if (isNullOrEmpty(_sourceCatalog)) { return true; }
    if (containsString(_sourceCatalog.name, this._search.keyword)) { return true; }

    let filteredCategories = _sourceCatalog.categories.filter((_category) => {
      if (containsString(_category.name, this._search.keyword)) { return true; }

      let filteredProducts = _category.products.filter((_product) =>
        containsString(_product.name, this._search.keyword)
      );
      _category.products = filteredProducts;
      return !isNullOrEmpty(filteredProducts);
    });
    _sourceCatalog.categories = filteredCategories;
    return !isNullOrEmpty(filteredCategories);
  }
}
