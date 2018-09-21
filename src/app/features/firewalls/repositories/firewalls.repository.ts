import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsRepositoryBase } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  Paginator,
  Search
} from '@app/shared';
import {
  McsApiSuccessResponse,
  McsFirewall,
  McsFirewallPolicy
} from '@app/models';
import { FirewallsService } from '../firewalls.service';

@Injectable()
export class FirewallsRepository extends McsRepositoryBase<McsFirewall> {

  constructor(private _firewallsService: FirewallsService) {
    super();
  }

  /**
   * This will obtain the firewall policies values from API
   * and update the policies of the active firewall
   * @param activeFirewall Active firewall to set policies
   */
  public findFirewallPolicies(
    activeFirewall: McsFirewall,
    page?: Paginator,
    search?: Search
  ): Observable<McsApiSuccessResponse<McsFirewallPolicy[]>> {
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
  ): Observable<McsApiSuccessResponse<McsFirewall[]>> {
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
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsFirewall>> {
    return this._firewallsService.getFirewall(recordId);
  }
}
