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
import { McsNetworkDnsZone } from '@app/models';
import { unsubscribeSafely } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { DnsZoneDetailsService } from '../dns-zone.service';



@Component({
  selector: 'mcs-dns-zone-overview',
  templateUrl: './dns-zone-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DnsZoneOverviewComponent implements OnInit, OnDestroy {
  public selectedDnsZone$: Observable<McsNetworkDnsZone>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _translate: TranslateService,
    private _dnsZoneDetailsService: DnsZoneDetailsService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToDnsDetails();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _subscribeToDnsDetails(): void {
    this.selectedDnsZone$ = this._dnsZoneDetailsService.getDnsZoneDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
