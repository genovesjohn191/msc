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
import {
  McsDataSource,
  McsDataStatus,
  McsPaginator,
  McsSearch
} from '../../../../core';
import {
  isNullOrEmpty,
  getSafeProperty
} from '../../../../utilities';
import { FirewallPolicy } from '../../models';
import { FirewallsRepository } from '../../repositories/firewalls.repository';
import { FirewallService } from '../firewall.service';

export class FirewallPoliciesDataSource implements McsDataSource<FirewallPolicy> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

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
  public connect(): Observable<FirewallPolicy[]> {
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
            this.dataLoadingStream.next(McsDataStatus.InProgress);
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
  public onCompletion(_status: McsDataStatus): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.showLoading(false);
  }
}
