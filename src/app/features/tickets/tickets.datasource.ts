import {
  Observable,
  Subject,
  of,
  merge
} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  McsDataSource,
  Paginator,
  Search
} from '@app/shared';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsDataStatus,
  McsTicket
} from '@app/models';
import { TicketsRepository } from '@app/services';

export class TicketsDataSource implements McsDataSource<McsTicket> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  constructor(
    private _ticketRepository: TicketsRepository,
    private _paginator: Paginator,
    private _search: Search
  ) {
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<McsTicket[]> {
    const displayDataChanges = [
      of(undefined), // Add undefined observable to make way of retry when error occured
      this._ticketRepository.dataRecordsChanged,
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
            this.dataLoadingStream.next(McsDataStatus.InProgress);
          }

          // Find all records based on settings provided in the input
          return this._ticketRepository.findAllRecords(this._paginator, this._search);
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
   * @param tickets Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.showLoading(false);
  }
}
