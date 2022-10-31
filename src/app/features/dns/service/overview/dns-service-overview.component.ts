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
import { unsubscribeSafely } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { McsNetworkDnsService } from '@app/models';
import { DnsServiceDetailsService } from '../dns-service.service';

@Component({
  selector: 'mcs-dns-service-overview',
  templateUrl: './dns-service-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DnsServiceOverviewComponent implements OnInit, OnDestroy {
  public selectedDnsService$: Observable<McsNetworkDnsService>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _translate: TranslateService,
    private _dnsDetailsService: DnsServiceDetailsService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToDnsDetails();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public isPrimary(dns: McsNetworkDnsService): string {
    return dns?.isPrimary ?
      this._translate.instant('label.primary') :
      this._translate.instant('label.secondary');
  }

  private _subscribeToDnsDetails(): void {
    this.selectedDnsService$ = this._dnsDetailsService.getDnsServiceDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
