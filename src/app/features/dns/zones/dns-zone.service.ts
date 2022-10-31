import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { McsNetworkDnsZone } from '@app/models';

@Injectable()
export class DnsZoneDetailsService {
  private _zoneDetailsChange = new BehaviorSubject<McsNetworkDnsZone>(null);

  public getDnsZoneDetailsId(): string {
    return this._zoneDetailsChange.getValue().id;
  }

  public getDnsZoneDetails(): Observable<McsNetworkDnsZone> {
    return this._zoneDetailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setDnsZoneDetails(data: McsNetworkDnsZone): void {
    this._zoneDetailsChange.next(data);
  }
}
