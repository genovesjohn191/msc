import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { McsNetworkDnsService } from '@app/models';

@Injectable()
export class DnsServiceDetailsService {
  private _serviceDetailsChange = new BehaviorSubject<McsNetworkDnsService>(null);

  public getDnsServiceDetailsId(): string {
    return this._serviceDetailsChange.getValue().id;
  }

  public getDnsServiceDetails(): Observable<McsNetworkDnsService> {
    return this._serviceDetailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setDnsServiceDetails(data: McsNetworkDnsService): void {
    this._serviceDetailsChange.next(data);
  }
}
