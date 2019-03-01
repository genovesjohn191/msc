import {
  Observable,
  merge,
  of
} from 'rxjs';
import { map } from 'rxjs/operators';
import { McsListSourceBase } from '@app/core';
import {
  compareStrings,
  containsString,
  isNullOrEmpty,
  cloneObject
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  McsKeyValuePair,
  McsProductCatalog
} from '@app/models';
import { McsProductCatalogRepository } from '@app/services';

export class ProductCatalogListSource extends McsListSourceBase<McsProductCatalog> {

  constructor(
    private _catalogRepository: McsProductCatalogRepository,
    private _search: Search) {
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
  public catalogSortMethod(first: McsProductCatalog, second: McsProductCatalog): number {
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
  protected getAllRecords(): Observable<McsProductCatalog[]> {
    return this._catalogRepository.getAll()
      .pipe(
        map((response) => {
          // We need to create a new product object in here
          // because we are eliminating other products that are
          // not in the keyword.
          return cloneObject<McsProductCatalog[]>(response);
        })
      );
  }

  /**
   * Filters all the records based on searched keyword
   * @param _record Record to be checked if it is included
   */
  protected filterMethod(_record: McsProductCatalog): boolean {
    if (isNullOrEmpty(_record)) { return true; }
    if (containsString(_record.name, this._search.keyword)) { return true; }

    let filteredCategories = _record.categories.filter((_category) => {
      if (containsString(_category.name, this._search.keyword)) { return true; }

      let filteredProducts = _category.products.filter((_product) =>
        containsString(_product.name, this._search.keyword)
      );
      _category.products = filteredProducts;
      return !isNullOrEmpty(filteredProducts);
    });
    _record.categories = filteredCategories;
    return !isNullOrEmpty(filteredCategories);
  }
}
