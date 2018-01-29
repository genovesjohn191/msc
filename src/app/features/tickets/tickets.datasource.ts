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
import { containsString } from '../../utilities';
import { Ticket } from './models';
import { TicketsRepository } from './tickets.repository';

export class TicketsDataSource implements McsDataSource<Ticket> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  constructor(
    private _ticketRepository: TicketsRepository,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) {
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Ticket[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._ticketRepository.dataRecordsChanged,
      this._paginator.pageChangedStream,
      this._search.searchChangedStream,
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap(() => {
        // Notify the table that a process is currently in-progress
        this.dataLoadingStream.next(McsDataStatus.InProgress);

        // Find all records based on settings provided in the input
        return this._ticketRepository.findAllRecords(
          this._paginator,
          (_item: Ticket) => {
            return containsString(
              _item.description
              + _item.crispTicketNumber
              + _item.shortDescription
              + _item.requestor, this._search.keyword);
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
   * @param tickets Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.showLoading(false);
  }
}
