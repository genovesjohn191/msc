import {
  Observable,
  merge,
  of
} from 'rxjs';
import { McsListSourceBase } from '@app/core';
import {
  compareStrings,
  isNullOrEmpty,
  containsString
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  McsKeyValuePair,
  McsResourceMedia
} from '@app/models';
import { MediaRepository } from './repositories/media.repository';

export class MediaListSource extends McsListSourceBase<McsResourceMedia> {

  constructor(
    private _mediaRepository: MediaRepository,
    private _search: Search) {
    super();
  }

  /**
   * Catalog listing sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public catalogSortMethod(first: McsKeyValuePair, second: McsKeyValuePair): number {
    return compareStrings(first.key, second.key);
  }

  /**
   * Media catalog name sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public mediaSortMethod(first: McsResourceMedia, second: McsResourceMedia): number {
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
  protected getAllRecords(): Observable<McsResourceMedia[]> {
    return this._mediaRepository.findAllRecords();
  }

  /**
   * Filters all the records based on searched keyword
   * @param _record Record to be checked if it is included
   */
  protected filterMethod(_record: McsResourceMedia): boolean {
    if (isNullOrEmpty(_record)) { return true; }
    return containsString(_record.name, this._search.keyword);
  }
}
