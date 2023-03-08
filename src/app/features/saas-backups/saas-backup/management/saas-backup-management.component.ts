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
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  McsFilterInfo,
  McsJob,
  McsSaasBackupAttempt,
  McsStorageSaasBackup,
  McsStorageSaasBackupAttempt,
  McsStorageSaasBackupAttemptQueryParams,
  McsStorageSaasBackupBackupAttempt,
  McsStorageSaasBackupJobType,
  SaasBackupStatus,
  saasBackupStatusText
} from '@app/models';
import {
  addDaysToDate,
  animateFactory,
  createObject,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsDateTimeService,
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
import moment from 'moment';

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
  public readonly dataSource: McsTableDataSource2<McsStorageSaasBackupAttempt>;
  public readonly dataEvents: McsTableEvents<McsStorageSaasBackupAttempt>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public selectedSaasBackup$: Observable<McsStorageSaasBackup>;

  public jobTypes: McsStorageSaasBackupJobType[];
  public saasServiceHasActiveJob: boolean = false;

  private _destroySubject = new Subject<void>();
  private _currentUserJobHandler: Subscription;

  public constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dateTimeService: McsDateTimeService,
    private _eventDispatcher: EventBusDispatcherService,
    private _saasBackupService: SaasBackupService
  ) {
    this._subscribeToSaasBackupDetails();
    this.dataSource = new McsTableDataSource2(this._getSaasBackupBackupAttempt.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'startedOn' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'completedOn' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'jobName' }),
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

  public get lastBackupAttemptStatusEnum(): typeof SaasBackupStatus {
    return SaasBackupStatus;
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

  public hasStatusLabel(status: string): boolean {
    return !isNullOrEmpty(saasBackupStatusText[status]);
  }

  public lastBackupAttemptStatusNotRunning(status: string): boolean {
    return status !== SaasBackupStatus.Running;
  }

  public convertDailyScheduleToLocalTime(dailySchedule: string): string {
    let formattedDate = this._dateTimeService.formatTimeToLocalTimeSettings(dailySchedule, 'HH:mmA', 'hh:mm A');
    return formattedDate;
  }

  public isDateTimeMoreThanADay(dateTime: Date): boolean {
    let hours = moment().diff(moment(dateTime), 'hours');
    if (hours > 24) {
      return true;
    }
    return false;
  }

  public onClickAttemptSaasBackup(saasId: string, type: string): void {
    this._updateJobTypeWithActiveJob(saasId, type);
    this.saasServiceHasActiveJob = true;
    this._changeDetectorRef.markForCheck();

    let queryParam = new McsSaasBackupAttempt();
    queryParam.type = type;

    this._apiService.attemptSaasBackup(saasId, queryParam).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    ).subscribe();
  }

  private _updateJobTypeWithActiveJob(saasId: string, type: string): void {
    let jobTypeHasActiveJob = this.jobTypes?.find((jobType) => jobType?.type === type &&
      this._saasBackupService.getSaasBackupId() === saasId);
    
    if (isNullOrEmpty(jobTypeHasActiveJob)) { return; }
    this.jobTypes.map((jobType) => {
      if (jobType.type === jobTypeHasActiveJob.type && saasId === this._saasBackupService.getSaasBackupId()) {
        jobType.hasActiveJob = true;
      }
    })
    this._changeDetectorRef.markForCheck();
  }

  private _registerEvents(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobSaasBackupAttempt, this._onBackupAttemptJob.bind(this));

    this._eventDispatcher.dispatch(McsEvent.jobSaasBackupAttempt);
  }

  private _onBackupAttemptJob(job: McsJob): void {
    this.jobTypes?.map((jobType) => {
      let activeJobFound = jobType?.type === job?.clientReferenceObject?.type &&
      this._saasBackupService.getSaasBackupId() ===  job?.clientReferenceObject?.saasId;

      if (!activeJobFound) { return; }

      if (activeJobFound && job?.inProgress) {
        jobType.hasActiveJob = true;
        this.saasServiceHasActiveJob = true;
        this._changeDetectorRef.markForCheck();
        return;
      }
  
      jobType.hasActiveJob = false;
      this.saasServiceHasActiveJob = false;
      this._changeDetectorRef.markForCheck();
      if (!activeJobFound) { return; }
  
      if (!job.inProgress) {
        this.retryDatasource();
        return;
      }
    });
  }

  private _subscribeToSaasBackupDetails(): void {
    this.selectedSaasBackup$ = this._saasBackupService.getSaasBackup().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1));
  }

  private _getSaasBackupBackupAttempt(param?: McsMatTableQueryParam):
    Observable<McsMatTableContext<McsStorageSaasBackupAttempt>> {

    return this.selectedSaasBackup$.pipe(
      switchMap((selectedSaasBackup: McsStorageSaasBackup) => {

        let query = new McsStorageSaasBackupAttemptQueryParams();
        query.periodStart = this._getPeriodStartRange();

        return this._apiService.getSaasBackupBackupAttempt(selectedSaasBackup.id, query).pipe(
          map((response: McsStorageSaasBackupBackupAttempt) => {
            this.jobTypes = this._sortJobTypeByFriendlyName(getSafeProperty(response, obj => obj.jobTypes));
            this._changeDetectorRef.markForCheck();
            let backupAttempts = getSafeProperty(response, obj => obj.backupAttempts);

            return new McsMatTableContext(backupAttempts, backupAttempts?.length)
        }))
      }));
  }

  private _sortJobTypeByFriendlyName(jobTypes: McsStorageSaasBackupJobType[]): McsStorageSaasBackupJobType[] {
    if (jobTypes?.length === 0) { return []; }
    return jobTypes.sort((a, b) => {
      if (a.typeFriendlyName === b.typeFriendlyName) { return 0; }
      if (isNullOrEmpty(a.typeFriendlyName)) { return 1; }
      if (isNullOrEmpty(b.typeFriendlyName)) { return -1; }
      return a.typeFriendlyName < b.typeFriendlyName ? -1 : 1;
    });
  }

  private _getPeriodStartRange(): string {
    let utcDateTime = moment.utc(addDaysToDate(getCurrentDate(), -7));
    return utcDateTime.format('YYYY-MM-DDThh:mm:ssZ');
  }
}