import {
  Observable,
  merge,
  of
} from 'rxjs';
import {
  McsListSourceBase,
  McsSearch,
  McsKeyValuePair
} from '../../core';
import { compareStrings } from '../../utilities';
import { Media } from './models';
import { MediaRepository } from './repositories/media.repository';

export class MediaListSource extends McsListSourceBase<Media> {

  constructor(
    private _mediaRepository: MediaRepository,
    private _search: McsSearch) {
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
  public mediaSortMethod(first: Media, second: Media): number {
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
  protected getAllRecords(): Observable<Media[]> {
    return this._mediaRepository.findAllRecords(undefined, this._search);
  }
}
