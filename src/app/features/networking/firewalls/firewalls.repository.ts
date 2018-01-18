import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsRepositoryBase,
  McsApiSuccessResponse
} from '../../../core';
import { FirewallsService } from './firewalls.service';
import { Firewall } from './models';

@Injectable()
export class FirewallsRepository extends McsRepositoryBase<Firewall> {

  constructor(private _firewallsService: FirewallsService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data inbound
   */
  protected getAllRecords(recordCount: number): Observable<McsApiSuccessResponse<Firewall[]>> {
    return this._firewallsService.getFirewalls({
      perPage: recordCount
    });
  }
}
