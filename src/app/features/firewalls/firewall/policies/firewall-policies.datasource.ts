import {
  Observable,
  Subject,
  of,
  merge
} from 'rxjs';
import {
  map,
  switchMap
} from 'rxjs/operators';
import { DataStatus } from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  McsDataSource,
  Paginator,
  Search
} from '@app/shared';
import { McsFirewallPolicy } from '@app/models';
import { FirewallsRepository } from '@app/services';
import { FirewallService } from '../firewall.service';

export class FirewallPoliciesDataSource implements McsDataSource<McsFirewallPolicy> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<DataStatus>;

  /**
   * Returns the total record count obtained in the datasource
   */
  private _totalRecordCount: number;
  public get totalRecordCount(): number { return this._totalRecordCount; }
  public set totalRecordCount(value: number) {
    this._totalRecordCount = value;
  }

  constructor(
    private _firewallsRepository: FirewallsRepository,
    private _firewallService: FirewallService,
    private _paginator: Paginator,
    private _search: Search
  ) {
    this._totalRecordCount = 0;
    this.dataLoadingStream = new Subject<DataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<McsFirewallPolicy[]> {
    const displayDataChanges = [
      of(undefined),
      this._paginator.pageChangedStream,
      this._search.searchChangedStream
    ];

    return merge(...displayDataChanges)
      .pipe(
        switchMap((instance) => {
          // Notify the table that a process is currently in-progress
          // if the user is not searching because the filtering has already a loader
          // and we need to check it here since the component can be recreated during runtime
          let isSearching = !isNullOrEmpty(instance) && (instance as any).searching;
          if (!isSearching) {
            this.dataLoadingStream.next(DataStatus.InProgress);
          }

          // Find all records based on settings provided in the input
          return this._firewallsRepository.findFirewallPolicies(
            this._firewallService.selectedFirewall,
            this._paginator,
            this._search)
            .pipe(
              map((response) => {
                this._totalRecordCount = getSafeProperty(response, (obj) => obj.totalCount, 0);
                return getSafeProperty(response, (obj) => obj.content);
              })
            );
        })
      );
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
   * @param policies Data to be provided when the datasource is connected
   */
  public onCompletion(_status: DataStatus): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.showLoading(false);
  }
}
