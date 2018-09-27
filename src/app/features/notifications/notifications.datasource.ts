import {
  Observable,
  Subject,
  of,
  merge
} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsDataSource,
  Paginator,
  Search
} from '@app/shared';
import {
  DataStatus,
  McsJob
} from '@app/models';
import { NotificationsRepository } from '@app/services';

export class NotificationsDataSource implements McsDataSource<McsJob> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<DataStatus>;

  constructor(
    private _notificationsRepository: NotificationsRepository,
    private _paginator: Paginator,
    private _search: Search
  ) {
    this.dataLoadingStream = new Subject<DataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<McsJob[]> {
    const displayDataChanges = [
      of(undefined), // Add undefined observable to make way of retry when error occured
      this._notificationsRepository.dataRecordsChanged,
      this._paginator.pageChangedStream,
      this._search.searchChangedStream,
    ];

    return merge(...displayDataChanges)
      .pipe(
        switchMap((instance) => {
          // Notify the table that a process is currently in-progress
          // if the user is not searching because the filtering has already a loader
          // and we need to check it here since the component can be recreated during runtime
          let isSearching = !isNullOrEmpty(instance) && instance.searching;
          if (!isSearching) {
            this.dataLoadingStream.next(DataStatus.InProgress);
          }

          // Find all records based on settings provided in the input
          return this._notificationsRepository.findAllRecords(this._paginator, this._search);
        })
      );
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    // Release resources
  }

  /**
   * This will invoke when the data obtainment is completed
   * @param notifications Data to be provided when the datasource is connected
   */
  public onCompletion(_status: DataStatus): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.showLoading(false);
  }
}
