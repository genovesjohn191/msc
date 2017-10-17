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
import { Server } from './models';
import { ServersService } from './servers.service';

export class ServersDataSource implements McsDataSource<Server> {
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

  /**
   * Current displayed record on the table listing
   */
  private _displayedRecord: Server[];
  public get displayedRecord(): Server[] {
    return this._displayedRecord;
  }
  public set displayedRecord(value: Server[]) {
    if (this._displayedRecord !== value) {
      this._displayedRecord = value;
    }
  }

  constructor(
    private _serversService: ServersService,
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
  public connect(): Observable<Server[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._paginator.pageChangedStream,
      this._search.searchChangedStream
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap(() => {
        this.dataLoadingStream.next(McsDataStatus.InProgress);
        let displayedRecords = this._paginator.pageSize * (this._paginator.pageIndex + 1);

        this._search.showLoading(true);
        return this._serversService.getServers(
          undefined,
          displayedRecords,
          this._search.keyword
        ).map((response) => {
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
   * @param servers Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus, _record: Server[]): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.pageCompleted();
    this.displayedRecord = _record;
  }

  /**
   * Get the displayed server by ID
   * @param serverId Server Id to obtained
   */
  public getDisplayedServerById(serverId: any): Server {
    if (isNullOrEmpty(this.displayedRecord)) { return ;}
    return this.displayedRecord.find((server) => server.id === serverId);
  }
}
