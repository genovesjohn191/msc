import {
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  DataStatus,
  McsFilterInfo,
  McsJob,
  McsStateNotification,
  McsStorageSaasBackup,
  McsStorageSaasBackupAttempt,
  McsStorageSaasBackupBackupAttempt,
  McsStorageSaasBackupLastBackupAttempt
} from '@app/models';
import {
  animateFactory,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsJobEvents,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsApiService } from '@app/services';
import { ColumnFilter } from '@app/shared';
import { McsEvent } from '@app/events';
import { EventBusDispatcherService } from '@app/event-bus';
import { SaasBackupService } from '../saas-backup.service';

export interface SaasUsersConfig {
  selectedBackupAttemptId: string,
  selectedSaasBackupId: string
}

@Component({
  selector: 'mcs-saas-backup-management',
  templateUrl: './saas-backup-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  },
  animations: [
    animateFactory.expansionVertical
  ]
})

export class SaasBackupManagementComponent implements OnInit, OnDestroy {
  public readonly jobEvents: McsJobEvents;
  public readonly dataSource: McsTableDataSource2<McsStorageSaasBackupAttempt>;
  public readonly dataEvents: McsTableEvents<McsStorageSaasBackupAttempt>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public selectedSaasBackup$: Observable<McsStorageSaasBackup>;

  public lastBackupAttempt: McsStorageSaasBackupLastBackupAttempt;
  public expandedElement: McsStorageSaasBackupAttempt;
  public saasUsersConfig: SaasUsersConfig;
  public hasActiveJob: boolean = false;

  private _destroySubject = new Subject<void>();
  private _currentUserJobHandler: Subscription;

  public constructor(
    injector: Injector,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _saasBackupService: SaasBackupService
  ) {
    this._subscribeToSaasBackupDetails();
    this.jobEvents = new McsJobEvents(injector);
    this.dataSource = new McsTableDataSource2(this._getSaasBackupBackupAttempt.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'select' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'date' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'protectedUsers' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' })
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public ngOnInit(): void {
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public attemptSaasBackup(saasId: string): void {
    this.hasActiveJob = true;
    this._changeDetectorRef.markForCheck();

    this.jobEvents.setStatus(DataStatus.Active);

    this._apiService.attemptSaasBackup(saasId).pipe(
      tap(job => {
        this.jobEvents.setJobs(job).setStatus(DataStatus.Success);
      }),
      catchError(error => {
        this.jobEvents.setStatus(DataStatus.Error);
        return throwError(() => error);
      })
    ).subscribe();
  }

  public setExpandedRow(expandedRow: McsStorageSaasBackupAttempt,
    backupAttempt: McsStorageSaasBackupAttempt,
    saasId: string): any {
    this.saasUsersConfig = { 
      selectedBackupAttemptId: backupAttempt?.id,
      selectedSaasBackupId: saasId };
    return expandedRow === backupAttempt ? null : backupAttempt;
  }

  private _subscribeToSaasBackupDetails(): void {
    this.selectedSaasBackup$ = this._saasBackupService.getSaasBackup().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1));
  }

  private _registerEvents(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobSaasBackupAttempt, this._onBackupAttemptJob.bind(this));

    this._eventDispatcher.dispatch(McsEvent.jobSaasBackupAttempt);
  }

  private _onBackupAttemptJob(job: McsJob): void {
    let saasHasActiveJob = this._hasActiveJob(job);

    if (saasHasActiveJob && job?.inProgress) {
      this.hasActiveJob = true;
      this._changeDetectorRef.markForCheck();
      return;
    }

    this.hasActiveJob = false;
    this._changeDetectorRef.markForCheck();
    if (!saasHasActiveJob) { return; }

    if (!job.inProgress) {
      this.retryDatasource();
      return;
    }
  }

  private _hasActiveJob(job: McsJob): boolean {
    if (isNullOrEmpty(job) || isNullOrEmpty(this._saasBackupService.getSaasBackupId())) { return false; }
    return getSafeProperty(job, (obj) => obj.clientReferenceObject.saasId) === this._saasBackupService.getSaasBackupId();
  }

  private _getSaasBackupBackupAttempt(param?: McsMatTableQueryParam):
    Observable<McsMatTableContext<McsStorageSaasBackupAttempt>> {

    return this.selectedSaasBackup$.pipe(
      switchMap((selectedSaasBackup: McsStorageSaasBackup) => {
        return this._apiService.getSaasBackupBackupAttempt(selectedSaasBackup.id).pipe(
          map((response: McsStorageSaasBackupBackupAttempt) => {
            this.lastBackupAttempt = getSafeProperty(response, obj => obj.lastBackupAttempt);
            this._changeDetectorRef.markForCheck();
            let backupAttempts = getSafeProperty(response, obj => obj.backupAttempts);

            return new McsMatTableContext(backupAttempts, backupAttempts?.length)
        }))
      }));
  }
}