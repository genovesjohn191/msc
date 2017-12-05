import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsPaginator,
  McsSearch,
  McsDataStatus
} from '../../../core';
import { Firewall } from './models';
import { FirewallsService } from './firewalls.service';

export class FirewallsDataSource implements McsDataSource<Firewall> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  /**
   * It will populate the data when the obtainment is completed
   */
  private _totalRecordCount: number;
  public get totalRecordCount(): number {
    return this._totalRecordCount;
  }
  public set totalRecordCount(value: number) {
    this._totalRecordCount = value;
  }

  constructor(
    private _firewallsService: FirewallsService,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) {
    this._totalRecordCount = 0;
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Firewall[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._paginator.pageChangedStream,
      this._search.searchChangedStream
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap(() => {
        this.dataLoadingStream.next(McsDataStatus.InProgress);
        let displayedRecords = this._paginator.pageSize * (this._paginator.pageIndex + 1);

        return this._firewallsService.getFirewalls({
          page: undefined,
          perPage: displayedRecords,
          searchKeyword: this._search.keyword,
          notifyError: false
        }).map((response) => {
          this._totalRecordCount = response.totalCount;
          return response.content;
        });
      });
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    this._totalRecordCount = 0;
  }

  /**
   * This will invoke when the data obtainment is completed
   * @param firewalls Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.pageCompleted();
  }
}
