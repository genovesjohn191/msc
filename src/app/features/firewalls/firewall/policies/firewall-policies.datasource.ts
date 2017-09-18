import { Observable } from 'rxjs/Rx';
import {
  McsDataSource,
  McsPaginator,
  McsSearch
} from '../../../../core';
import {
  FirewallPolicy,
  FirewallPolicyAction,
  FirewallPolicyNat
} from '../../models';
import { FirewallService } from '../firewall.service';

export class FirewallPoliciesDataSource implements McsDataSource<FirewallPolicy> {
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
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<FirewallPolicy[]> {
    const displayDataChanges = [
      this._paginator.pageChangedStream,
      this._search.searchChangedStream,
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap(() => {
        let firewallId = this._firewallService.selectedFirewall.id;
        let displayedRecords = this._paginator.pageSize * (this._paginator.pageIndex + 1);

        return this._firewallService.getFirewallPolicies(
          firewallId,
          this._paginator.pageIndex,
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
   * @param tickets Data to be provided when the datasource is connected
   */
  public onCompletion(tickets?: FirewallPolicy[]): void {
    // Execute all data from completion
    this._paginator.pageCompleted();
  }

  /**
   * This will invoke when the data obtainment process encountered error
   * @param status Status of the error
   */
  public onError(status?: number): void {
    // Display the error template in the UI
  }
}
