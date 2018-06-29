import {
  Observable,
  of
} from 'rxjs';
import { McsApiSuccessResponse } from '../../../../core';
import { Firewall } from '../../firewalls';

export const mockFirewallsService = {

  getFirewalls(): Observable<McsApiSuccessResponse<Firewall[]>> {
    let mcsApiResponseMock = new McsApiSuccessResponse<Firewall[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array(new Firewall(), new Firewall());

    return of(mcsApiResponseMock);
  }

};
