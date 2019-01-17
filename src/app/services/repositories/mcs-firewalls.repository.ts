import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import { McsRepositoryBase } from '@app/core';
import {
  McsFirewall,
  McsQueryParam,
  McsFirewallPolicy
} from '@app/models';
import { FirewallsApiService } from '../api-services/firewalls-api.service';
import { McsFirewallsDataContext } from '../data-context/mcs-firewalls-data.context';

@Injectable()
export class McsFirewallsRepository extends McsRepositoryBase<McsFirewall> {

  constructor(private _firewallsApiService: FirewallsApiService) {
    super(new McsFirewallsDataContext(_firewallsApiService));
  }

  /**
   * This will obtain the firewall policies values from API
   * and update the policies of the active firewall
   * @param activeFirewall Active firewall to set policies
   * @param query Query on what data to be obtained
   */
  public getFirewallPolicies(
    activeFirewall: McsFirewall,
    query: McsQueryParam = new McsQueryParam()
  ): Observable<McsFirewallPolicy[]> {
    return this._firewallsApiService.getFirewallPolicies(activeFirewall.id, query).pipe(
      map((response) => {
        activeFirewall.policies = !isNullOrEmpty(response.content) ?
          response.content : new Array();
        this.addOrUpdate(activeFirewall);
        return response.content;
      })
    );
  }
}
