import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsApiSuccessResponse,
  McsPaginator,
  McsSearch
} from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
import { FirewallsService } from '../firewalls.service';
import {
  Firewall,
  FirewallPolicy
} from '../models';

@Injectable()
export class FirewallsRepository extends McsRepositoryBase<Firewall> {

  constructor(private _firewallsService: FirewallsService) {
    super();
  }

  /**
   * This will obtain the firewall policies values from API
   * and update the policies of the active firewall
   * @param activeFirewall Active firewall to set policies
   */
  public findFirewallPolicies(
    activeFirewall: Firewall,
    page?: McsPaginator,
    search?: McsSearch
  ): Observable<McsApiSuccessResponse<FirewallPolicy[]>> {
    return this._firewallsService.getFirewallPolicies(
      activeFirewall.id,
      {
        page: page.pageIndex,
        perPage: page.pageSize,
        searchKeyword: search.keyword
      })
      .pipe(
        map((response) => {
          activeFirewall.policies = !isNullOrEmpty(response.content) ?
            response.content : new Array();
          this.updateRecord(activeFirewall);
          return response;
        })
      );
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data inbound
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<Firewall[]>> {
    return this._firewallsService.getFirewalls({
      page: pageIndex,
      perPage: pageSize,
      searchKeyword: keyword
    });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<Firewall>> {
    return this._firewallsService.getFirewall(recordId);
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
  }
}
