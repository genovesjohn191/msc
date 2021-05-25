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
import { TranslateService } from '@ngx-translate/core';

import { DnsDetailsService } from '../dns-details.service';

@Component({
  selector: 'mcs-dns-management',
  templateUrl: './dns-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DnsManagementComponent implements OnInit, OnDestroy {
  public selectedDns$: Observable<McsNetworkDnsSummary>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _translate: TranslateService,
    private _dnsDetailsService: DnsDetailsService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToDnsDetails();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public isPrimary(dns: McsNetworkDnsSummary): string {
    return dns?.isPrimary ?
      this._translate.instant('label.primary') :
      this._translate.instant('label.secondary');
  }

  private _subscribeToDnsDetails(): void {
    this.selectedDns$ = this._dnsDetailsService.getDnsDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
