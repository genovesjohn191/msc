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
  McsSaasBackupAttempt,
  McsStorageSaasBackup,
  McsStorageSaasBackupAttempt,
  McsStorageSaasBackupAttemptQueryParams,
  McsStorageSaasBackupBackupAttempt,
  McsStorageSaasBackupJobType
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
  public readonly jobEvents: McsJobEvents;
  public readonly dataSource: McsTableDataSource2<McsStorageSaasBackupAttempt>;
  public readonly dataEvents: McsTableEvents<McsStorageSaasBackupAttempt>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public selectedSaasBackup$: Observable<McsStorageSaasBackup>;

  public jobTypes: McsStorageSaasBackupJobType[];

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
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'date' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'jobName' }),
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

  public convertArrayToString(dailySchedule: string[]): string {
    let convertedArray = dailySchedule.toString().replace(/,/g, ', ');
    return convertedArray;
  }

  public isRunTimeMoreThanADay(runTime: Date): boolean {
    let hours = moment().diff(moment(runTime), 'hours');
    if (hours > 24) {
      return true;
    }
    return false;
  }

  public onClickAttemptSaasBackup(saasId: string, type: string): void {
    this._updateJobTypeWithActiveJob(saasId, type);

    let queryParam = new McsSaasBackupAttempt();
    queryParam.type = type;

    this._changeDetectorRef.markForCheck();

    this.jobEvents.setStatus(DataStatus.Active);

    this._apiService.attemptSaasBackup(saasId, queryParam).pipe(
      tap(job => {
        this.jobEvents.setJobs(job).setStatus(DataStatus.Success);
      }),
      catchError(error => {
        this.jobEvents.setStatus(DataStatus.Error);
        return throwError(() => error);
      })
    ).subscribe();
  }

  private _updateJobTypeWithActiveJob(saasId: string, type: string): void {
    let jobTypeHasActiveJob = this.jobTypes?.find((jobType) => jobType?.type === type &&
      this._saasBackupService.getSaasBackupId() === saasId);
    
    if (isNullOrEmpty(jobTypeHasActiveJob)) { return; }
    this.jobTypes.map((job) => {
      if (job.type === jobTypeHasActiveJob.type && saasId === this._saasBackupService.getSaasBackupId()) {
        job.hasActiveJob = true;
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
    this.jobTypes.map((jobType) => {
      let activeJobFound = this.jobTypes?.find((jobType) => jobType?.type === job?.clientReferenceObject?.type &&
      this._saasBackupService.getSaasBackupId() ===  job?.clientReferenceObject?.saasId);

      if (isNullOrEmpty(activeJobFound)) { return; }

      if (activeJobFound && job?.inProgress) {
        jobType.hasActiveJob = true;
        this._changeDetectorRef.markForCheck();
        return;
      }
  
      jobType.hasActiveJob = false;
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
            let backupAttempts = this._getLatestDailyBackupAttempts(
              getSafeProperty(response, obj => obj.backupAttempts));

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

  private _getLatestDailyBackupAttempts(backAttempts: McsStorageSaasBackupAttempt[])
    : McsStorageSaasBackupAttempt[] {

    if (!backAttempts) return [];

    let groupedDaily: {[key: string]: McsStorageSaasBackupAttempt[]};
    groupedDaily = backAttempts.reduce(function (groupedItems, currentItem) {
        let key = new Date(currentItem.runTime).toLocaleDateString();
        groupedItems[key] = groupedItems[key] || [];
        groupedItems[key].push(currentItem);
        return groupedItems;
    }, Object.create(null));

    let latestDaily: McsStorageSaasBackupAttempt[] = [];
    Object.entries(groupedDaily).forEach(
      ([_, backupAttemptsPerDay]) => {
        if (backupAttemptsPerDay.length > 1) {
          backupAttemptsPerDay.sort((recA, recB) => 
            new Date(recB.runTime).getTime() - new Date(recA.runTime).getTime());
        }
        latestDaily.push(backupAttemptsPerDay[0])
      }
    );

    return latestDaily;
  }

  private _getPeriodStartRange(): string {
    let utcDateTime = moment.utc(addDaysToDate(getCurrentDate(), -7));
    return utcDateTime.format('YYYY-MM-DDThh:mm:ssZ');
  }
}