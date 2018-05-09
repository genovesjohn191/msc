import { Observable } from 'rxjs/Rx';
import {
  McsListSourceBase,
  McsSearch,
  McsKeyValuePair
} from '../../core';
import { compareStrings } from '../../utilities';
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
      Observable.of(undefined),
      this._catalogRepository.dataRecordsChanged,
      this._search.searchChangedStream,
    ];
    return Observable.merge(...dataStreams);
  }

  /**
   * Get all records from repository
   */
  protected getAllRecords(): Observable<ProductCatalog[]> {
    return this._catalogRepository.findAllRecords(undefined, this._search);
  }
}
