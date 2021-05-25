import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsNetworkDnsSummary } from '@app/models';
import { unsubscribeSafely } from '@app/utilities';

import { DnsDetailsService } from '../dns-details.service';

@Component({
  selector: 'mcs-dns-zones',
  templateUrl: './dns-zones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnsZonesComponent implements OnInit, OnDestroy {

  public dns$: Observable<McsNetworkDnsSummary>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _dnsDetailsService: DnsDetailsService
  ) {

  }

  public ngOnInit() {
    this._subscribeToDnsDetails();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public onUpdateRequest(): void {
    // TODO(apascual): Need to update the DNS details here
  }

  private _subscribeToDnsDetails(): void {
    this.dns$ = this._dnsDetailsService.getDnsDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
