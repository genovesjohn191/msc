import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus,
  McsPaginator,
  McsSearch,
  McsApiJob
} from '../../core';
import { NotificationsRepository } from './notifications.repository';

export class NotificationsDataSource implements McsDataSource<McsApiJob> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  constructor(
    private _notificationsRepository: NotificationsRepository,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) {
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<McsApiJob[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._notificationsRepository.dataRecordsChanged,
      this._paginator.pageChangedStream,
      this._search.searchChangedStream,
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap(() => {
        // Notify the table that a process is currently in-progress
        this.dataLoadingStream.next(McsDataStatus.InProgress);

        // Find all records based on settings provided in the input
        return this._notificationsRepository.findAllRecords(
          this._paginator, this._search,
          (_item: McsApiJob) => {
            return _item.description + _item.summaryInformation + _item.ownerName;
          });
      });
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
  public onCompletion(_status: McsDataStatus): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.showLoading(false);
  }
}
