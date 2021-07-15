import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { McsNetworkDbNetwork } from '@app/models';

@Injectable()
export class NetworkDbNetworkDetailsService{
  private _networkDetails = new BehaviorSubject<McsNetworkDbNetwork>(null);

  public getNetworkDetailsId(): string {
    return this._networkDetails.getValue().id;
  }

  public getNetworkDetails(): Observable<McsNetworkDbNetwork> {
    return this._networkDetails.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setNetworkDetails(param: McsNetworkDbNetwork): void {
    this._networkDetails.next(param);
  }
}
