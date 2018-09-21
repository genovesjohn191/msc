import {
  Observable,
  of
} from 'rxjs';
import {
  McsApiSuccessResponse,
  McsFirewall
} from '@app/models';

export const mockFirewallsService = {

  getFirewalls(): Observable<McsApiSuccessResponse<McsFirewall[]>> {
    let mcsApiResponseMock = new McsApiSuccessResponse<McsFirewall[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array(new McsFirewall(), new McsFirewall());

    return of(mcsApiResponseMock);
  }
};
