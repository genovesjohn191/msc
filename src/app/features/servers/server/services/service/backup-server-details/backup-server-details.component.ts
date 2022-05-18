import {
  of,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  filter,
  finalize,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  backupStatusLabel,
  backupStatusTypeMap,
  backupStatusTypeText,
  BackupStatus,
  BackupStatusType,
  InviewLevel,
  McsFilterInfo,
  McsQueryParam,
  McsServerBackupServerDetails,
  McsServerBackupServerLog
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-service-backup-server-details',
  templateUrl: './backup-server-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceBackupServerDetailsComponent implements OnChanges, OnDestroy {

  @Input()
  public serverId: string;

  private _serverBackupLogsCache: Observable<McsServerBackupServerLog[]>;
  private _serverBackupDetails: McsServerBackupServerDetails;
  private _sortDef: MatSort;
  private _sortSubject = new Subject<void>();

  public dataSourceInProgress$: BehaviorSubject<boolean>;
  public readonly serverBackupLogsDatasource: McsTableDataSource2<McsServerBackupServerLog>;
  public readonly serverBackupLogsColumns: McsFilterInfo[];

  private _serverBackupsChange = new BehaviorSubject<McsServerBackupServerLog[]>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.dataSourceInProgress$ = new BehaviorSubject(false);
    this.serverBackupLogsDatasource = new McsTableDataSource2(this._getServerBackups.bind(this));
    this.serverBackupLogsColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'startDate' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'endDate' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'duration' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'files' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'mbModified' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'dataProtectionVolume' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'deduplicationRatio' })
    ];
    this.serverBackupLogsDatasource.registerColumnsFilterInfo(this.serverBackupLogsColumns);
  }

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (isNullOrEmpty(value)) { return; }
    this._sortSubject.next();

    value.sortChange.pipe(
      takeUntil(this._sortSubject),
      tap(response => {
        if (!response) { return of(null); }
        this._updateTableDataSource(this.serverId);
      })
    ).subscribe();

    this._sortDef = value;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let serverId = changes['serverId'];
    if (!isNullOrEmpty(serverId)) {
      this._updateTableDataSource(this.serverId);
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get ellipsisKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get isInviewPremium(): boolean {
    return getSafeProperty(this._serverBackupDetails, (obj) => obj.inviewLevel) === InviewLevel.Premium;
  }

  public get retentionPeriod(): string {
    return getSafeProperty(this._serverBackupDetails, (obj) => obj.retentionPeriod, '');
  }

  public backupStatusToolTip(status: BackupStatus): string {
    return backupStatusLabel[status];
  }

  public backupStatusText(status: BackupStatus): string {
    let statusType = backupStatusTypeMap[status];
    return backupStatusTypeText[statusType];
  }

  public backupStatusTypeIconKey(status: BackupStatus): string {
    let statusType = backupStatusTypeMap[status];
    let statusIconKey: string = '';

    switch (statusType) {
      case BackupStatusType.Successful:
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case BackupStatusType.InProgress:
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case BackupStatusType.Failed:
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case BackupStatusType.NeverAttempted:
      default:
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_SUSPENDED;
        break;
    }
    return statusIconKey;
  }

  /**
   * Initializes the data source of the server backup logs table
   */
  private _updateTableDataSource(serverid: string): void {
    let queryParam = new McsQueryParam();
    queryParam.sortDirection = this._sortDef?.direction;
    queryParam.sortField = this._sortDef?.active;

    this.dataSourceInProgress$.next(true);
    let serverBackupApiSource: Observable<McsServerBackupServerLog[]>;

    if (!isNullOrEmpty(serverid)) {
      serverBackupApiSource = this._apiService.getServerBackupServerDetails(serverid, queryParam).pipe(
        map((response) => {
          this._serverBackupDetails = response;
          return getSafeProperty(response, (obj) => obj.logs);
        }),
        tap((response) => {
          this._serverBackupLogsCache = of(response);
        })
      );
    }

    let tableDataSource = (isNullOrEmpty(this._serverBackupLogsCache) || !isNullOrEmpty(this._sortDef?.direction)) ?
      serverBackupApiSource : this._serverBackupLogsCache;
    tableDataSource.pipe(
      finalize(() => this.dataSourceInProgress$.next(false))
    ).subscribe(records => this._serverBackupsChange.next(records || []));
    this._changeDetector.markForCheck();
  }

  private _getServerBackups(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsServerBackupServerLog>> {
    return this._serverBackupsChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => {
        return new McsMatTableContext(response, response?.length)
      })
    );
  }
}
