import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus,
  McsPaginator,
  McsSearch
} from '../../core';
import { isNullOrEmpty } from '../../utilities';
import { Media } from './models';
import { MediasRepository } from './medias.repository';

export class MediasDataSource implements McsDataSource<Media> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  constructor(
    private _mediasRepository: MediasRepository,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) {
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Media[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._mediasRepository.dataRecordsChanged,
      this._paginator.pageChangedStream,
      this._search.searchChangedStream
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap((instance) => {
        // Notify the table that a process is currently in-progress
        // if the user is not searching because the filtering has already a loader
        // and we need to check it here since the component can be recreated during runtime
        let isSearching = !isNullOrEmpty(instance) && instance.searching;
        if (!isSearching) {
          this.dataLoadingStream.next(McsDataStatus.InProgress);
        }

        // Find all records based on settings provided in the input
        return this._mediasRepository.findAllRecords(this._paginator, this._search);
      });
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    // Release all resources
  }

  /**
   * This will invoke when the data obtainment is completed
   */
  public onCompletion(_status: McsDataStatus, _record: Media[]): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.showLoading(false);
  }

  /**
   * Get the displayed media by ID
   * @param mediaId Media Id to obtained
   */
  public getDisplayedMediaById(mediaId: any): Media {
    if (isNullOrEmpty(this._mediasRepository.dataRecords)) { return; }
    return this._mediasRepository.dataRecords
      .find((media) => media.id === mediaId);
  }
}
