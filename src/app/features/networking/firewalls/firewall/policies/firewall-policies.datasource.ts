import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus,
  McsPaginator,
  McsSearch
} from '../../../../../core';
import { isNullOrEmpty } from '../../../../../utilities';
import { FirewallPolicy } from '../../models';
import { FirewallService } from '../firewall.service';

export class FirewallPoliciesDataSource implements McsDataSource<FirewallPolicy> {
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
      this._firewallService.selectedFirewallStream,
      this._paginator.pageChangedStream,
      this._search.searchChangedStream
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap((firewall) => {
        this.dataLoadingStream.next(McsDataStatus.InProgress);

        let firewallId = this._firewallService.selectedFirewall.id;
        let displayedRecords = this._paginator.pageSize * (this._paginator.pageIndex + 1);

        if (isNullOrEmpty(firewall)) {
          return Observable.of(undefined);
        }

        this._search.showLoading(true);
        return this._firewallService.getFirewallPolicies(
          firewallId,
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
   * @param policies Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.pageCompleted();
  }
}
