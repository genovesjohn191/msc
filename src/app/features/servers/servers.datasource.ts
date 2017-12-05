import {
  Observable,
  Subject,
  Subscription
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus,
  McsPaginator,
  McsSearch
} from '../../core';
import {
  isNullOrEmpty,
  deleteArrayRecord,
  refreshView
} from '../../utilities';
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

  /**
   * This will notify the stream of the table when there are changes on the servers data
   */
  private _serversStream: Subject<Server[]>;
  public get serversStream(): Subject<Server[]> {
    return this._serversStream;
  }
  public set serversStream(value: Subject<Server[]>) {
    this._serversStream = value;
  }

  /**
   * All servers
   */
  private _servers: Server[];
  public get servers(): Server[] {
    return this._servers;
  }
  public set servers(value: Server[]) {
    this._servers = value;
  }

  private _serversSubscription: Subscription;
  private _hasError: boolean;

  constructor(
    private _serversService: ServersService,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) {
    this._totalRecordCount = 0;
    this.dataLoadingStream = new Subject<McsDataStatus>();
    this.serversStream = new Subject<Server[]>();
    this._getServers();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Server[]> {
    const displayDataChanges = [
      this.serversStream
    ];

    return Observable.merge(...displayDataChanges)
      .map(() => {
        if (this._hasError) {
          throw Observable.throw(new Error(''));
        }
        return this.servers;
      });
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    this._totalRecordCount = 0;
    if (!isNullOrEmpty(this._serversSubscription)) {
      this._serversSubscription.unsubscribe();
    }
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

  public removeDeletedServer(server: Server): void {
    if (isNullOrEmpty(server)) { return; }

    refreshView(() => {
      this.servers = deleteArrayRecord(this.servers, (targetServer) => {
        return targetServer.id === server.id;
      });
      this._serversStream.next();
    });
  }

  /**
   * Get the displayed server by ID
   * @param serverId Server Id to obtained
   */
  public getDisplayedServerById(serverId: any): Server {
    if (isNullOrEmpty(this.displayedRecord)) { return; }
    return this.displayedRecord.find((server) => server.id === serverId);
  }

  private _getServers(): void {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._paginator.pageChangedStream,
      this._search.searchChangedStream
    ];

    this._serversSubscription = Observable.merge(...displayDataChanges)
      .switchMap(() => {
        this.dataLoadingStream.next(McsDataStatus.InProgress);
        let displayedRecords = this._paginator.pageSize * (this._paginator.pageIndex + 1);

        return this._serversService.getServers({
          page: undefined,
          perPage: displayedRecords,
          searchKeyword: this._search.keyword,
          notifyError: false
        }).map((response) => {
          this._totalRecordCount = response.totalCount;
          return response.content;
        });
      })
      .catch((error) => {
        this._hasError = true;
        this.serversStream.next(undefined);
        return Observable.throw(error);
      })
      .subscribe((servers) => {
        this.servers = servers;
        this._serversStream.next();
      });
  }
}
