import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { McsNetworkDnsSummary } from '@app/models';

@Injectable()
export class DnsDetailsService {
  private _detailsChange = new BehaviorSubject<McsNetworkDnsSummary>(null);

  public getDnsDetailsId(): string {
    return this._detailsChange.getValue().id;
  }

  public getDnsDetails(): Observable<McsNetworkDnsSummary> {
    return this._detailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setDnsDetails(data: McsNetworkDnsSummary): void {
    this._detailsChange.next(data);
  }
}
