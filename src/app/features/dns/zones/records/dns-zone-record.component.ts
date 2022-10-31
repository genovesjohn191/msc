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
  McsNetworkDnsZone,
  McsNetworkDnsZoneTtlRequest,
  McsStateNotification
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';


import { DialogService2 } from '@app/shared';
import { DnsZoneTtlEditDialogComponent } from '@app/features-shared';
import { McsEvent } from '@app/events';
import { EventBusDispatcherService } from '@app/event-bus';
import { TranslateService } from '@ngx-translate/core';
import { DnsZoneDetailsService } from '../dns-zone.service';

@Component({
  selector: 'mcs-dns-zone-record',
  templateUrl: './dns-zone-record.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnsZoneRecordComponent implements OnInit, OnDestroy {
  public zone$: Observable<McsNetworkDnsZone>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _dnsZoneDetailsService: DnsZoneDetailsService,
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
    this._apiService.getNetworkDnsZoneById(this._dnsZoneDetailsService.getDnsZoneDetailsId()).pipe(
      tap(details => this._dnsZoneDetailsService.setDnsZoneDetails(details))
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
    let dnsId = this._dnsZoneDetailsService.getDnsZoneDetailsId();
    this._apiService.updateNetworkDnsZoneTTL(zone.id, payload).pipe(
      tap(() => {
        this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
          new McsStateNotification('success', 'message.successfullyUpdated')
        );
        this.onUpdateRequest();
      }),
    ).subscribe();
  }

  private _subscribeToDnsDetails(): void {
    this.zone$ = this._dnsZoneDetailsService.getDnsZoneDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
