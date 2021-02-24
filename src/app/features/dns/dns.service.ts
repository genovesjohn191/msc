import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { McsNetworkDnsSummary } from '@app/models';

@Injectable()
export class DnsService {
  private _dnsDetails = new BehaviorSubject<McsNetworkDnsSummary>(null);
  private _dnsId: string;

  public getDnsDetails(): Observable<McsNetworkDnsSummary> {
    return this._dnsDetails.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setDnsDetails(dnsDetails: McsNetworkDnsSummary): void {
    this._dnsDetails.next(dnsDetails);
  }

  public setDnsId(dnsId: string): void {
    this._dnsId = dnsId;
  }

  public getDnsId(): string {
    return this._dnsId;
  }
}
