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
  OnInit
} from '@angular/core';

import { McsStorageSaasBackup } from '@app/models';
import { unsubscribeSafely } from '@app/utilities';
import { SaasBackupService } from '../saas-backup.service';

@Component({
  selector: 'mcs-saas-backup-overview',
  templateUrl: './saas-backup-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SaasBackupOverviewComponent implements OnInit, OnDestroy {
  public selectedSaasBackup$: Observable<McsStorageSaasBackup>;

  private _destroySubject = new Subject<void>();

  public constructor(private _saasBackupService: SaasBackupService) { }

  public ngOnInit(): void {
    this._subscribeToSaasBackupDetails();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _subscribeToSaasBackupDetails(): void {
    this.selectedSaasBackup$ = this._saasBackupService.getSaasBackup().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
