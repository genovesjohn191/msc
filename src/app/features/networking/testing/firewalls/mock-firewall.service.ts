import {
  Observable,
  Subject,
  of
} from 'rxjs';
import { McsApiSuccessResponse } from '../../../../core';
import {
  Firewall,
  FirewallPolicy
} from '../../firewalls';

export const mockFirewallService = {

  selectedFirewallStream: new Subject<Firewall>(),
  selectedFirewall: new Firewall(),

  getFirewall(_id: any): Observable<McsApiSuccessResponse<Firewall>> {
    let mcsApiResponseMock = new McsApiSuccessResponse<Firewall>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = new Firewall();

    return of(mcsApiResponseMock);
  },

  getFirewallPolicies(_id: any): Observable<McsApiSuccessResponse<FirewallPolicy[]>> {
    let mcsApiResponseMock = new McsApiSuccessResponse<FirewallPolicy[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array(new FirewallPolicy(), new FirewallPolicy());

    return of(mcsApiResponseMock);
  },

  setSelectedFirewall(_id: any): void {
    return this.selectedFirewallStream.next(new Firewall());
  }

};
