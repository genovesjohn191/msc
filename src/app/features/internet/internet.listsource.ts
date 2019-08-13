import {
  Observable,
  of,
  merge
} from 'rxjs';
import { map } from 'rxjs/operators';
import { McsListSourceBase } from '@app/core';
import {
  compareStrings,
  isNullOrEmpty,
  containsString,
  CommonDefinition
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  McsKeyValuePair,
  McsInternetPort
} from '@app/models';
import { McsApiService } from '@app/services';

export class InternetListSource extends McsListSourceBase<McsInternetPort> {

  constructor(
    private _apiService: McsApiService,
    private _search: Search
  ) {
    super();
  }

  /**
   * Internet port listing Group sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public internetGroupSortMethod(first: McsKeyValuePair, second: McsKeyValuePair): number {
    return compareStrings(first.key, second.key);
  }

  /**
   * Internet port listing sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public internetSortMethod(first: McsInternetPort, second: McsInternetPort): number {
    return compareStrings(first.description, second.description);
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
  protected getAllRecords(): Observable<McsInternetPort[]> {
    return this._apiService.getInternetPorts({
      pageIndex: CommonDefinition.PAGE_INDEX_DEFAULT,
      pageSize: CommonDefinition.PAGE_SIZE_MAX
    }).pipe(
      map((response) => response && response.collection)
    );
  }

  /**
   * Filters all the records based on searched keyword
   * @param _record Record to be checked if it is included
   */
  protected filterMethod(_record: McsInternetPort): boolean {
    if (isNullOrEmpty(_record)) { return true; }
    return containsString(_record.description, this._search.keyword);
  }
}
