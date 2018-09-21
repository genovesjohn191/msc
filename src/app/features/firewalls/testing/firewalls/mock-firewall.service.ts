import {
  Observable,
  Subject,
  of
} from 'rxjs';
import {
  McsApiSuccessResponse,
  McsFirewall,
  McsFirewallPolicy
} from '@app/models';

export const mockFirewallService = {

  selectedFirewallStream: new Subject<McsFirewall>(),
  selectedFirewall: new McsFirewall(),

  getFirewall(_id: any): Observable<McsApiSuccessResponse<McsFirewall>> {
    let mcsApiResponseMock = new McsApiSuccessResponse<McsFirewall>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = new McsFirewall();

    return of(mcsApiResponseMock);
  },

  getFirewallPolicies(_id: any): Observable<McsApiSuccessResponse<McsFirewallPolicy[]>> {
    let mcsApiResponseMock = new McsApiSuccessResponse<McsFirewallPolicy[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array(new McsFirewallPolicy(), new McsFirewallPolicy());

    return of(mcsApiResponseMock);
  },

  setSelectedFirewall(_id: any): void {
    return this.selectedFirewallStream.next(new McsFirewall());
  }

};
