import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  McsNetworkDnsSummary,
  McsNetworkDnsZone,
  McsNetworkDnsZoneTtlRequest,
  McsStateNotification
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import { DnsDetailsService } from '../dns-details.service';
import { DialogService2 } from '@app/shared';
import { DnsZoneTtlEditDialogComponent } from '@app/features-shared';
import { McsEvent } from '@app/events';
import { EventBusDispatcherService } from '@app/event-bus';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-dns-zones',
  templateUrl: './dns-zones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnsZonesComponent implements OnInit, OnDestroy {
  public dns$: Observable<McsNetworkDnsSummary>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _dnsDetailsService: DnsDetailsService,
    private _apiService: McsApiService,
    private _dialogService: DialogService2,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService
  ) {
  }

  public ngOnInit() {
    this._subscribeToDnsDetails();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public onUpdateRequest(): void {
    this._apiService.getNetworkDnsById(this._dnsDetailsService.getDnsDetailsId()).pipe(
      tap(details => this._dnsDetailsService.setDnsDetails(details))
    ).subscribe();
  }

  public editZoneTtl(selectedZone: McsNetworkDnsZone): void {
    let dialogRef = this._dialogService.open(DnsZoneTtlEditDialogComponent, {
      data: {
        title: this._translateService.instant('dialog.dnsZoneTtlEdit.title'),
        message: this._translateService.instant('dialog.dnsZoneTtlEdit.message'),
        zone: selectedZone,
        ttlSeconds: selectedZone.ttlSeconds
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!isNullOrEmpty(result) && !isNaN(result)) {
          this._saveTTLChanges({
            ttlSeconds: result
          }, selectedZone);
        }
      }
    });
  }

  private _saveTTLChanges(payload: McsNetworkDnsZoneTtlRequest, zone: McsNetworkDnsZone): void {
    let dnsId = this._dnsDetailsService.getDnsDetailsId();
    this._apiService.updateNetworkDnsZoneTTL(dnsId, zone.id, payload).pipe(
      tap(() => {
        this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
          new McsStateNotification('success', 'message.successfullyUpdated')
        );
        this.onUpdateRequest();
      }),
    ).subscribe();
  }

  private _subscribeToDnsDetails(): void {
    this.dns$ = this._dnsDetailsService.getDnsDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
