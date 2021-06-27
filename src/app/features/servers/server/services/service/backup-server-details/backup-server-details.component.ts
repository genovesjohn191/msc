import {
  of,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  filter,
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
  SimpleChanges
} from '@angular/core';
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

  public readonly serverBackupLogsDatasource: McsTableDataSource2<McsServerBackupServerLog>;
  public readonly serverBackupLogsColumns: McsFilterInfo[];

  private _serverBackupsChange = new BehaviorSubject<McsServerBackupServerLog[]>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef
  ) {
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
    let serverBackupApiSource: Observable<McsServerBackupServerLog[]>;
    if (!isNullOrEmpty(serverid)) {
      serverBackupApiSource = this._apiService.getServerBackupServerDetails(serverid).pipe(
        map((response) => {
          this._serverBackupDetails = response;
          return getSafeProperty(response, (obj) => obj.logs);
        }),
        tap((response) => {
          this._serverBackupLogsCache = of(response);
        })
      );
    }

    let tableDataSource = isNullOrEmpty(this._serverBackupLogsCache) ?
      serverBackupApiSource : this._serverBackupLogsCache;
    tableDataSource.subscribe(records => this._serverBackupsChange.next(records || []));
    this._changeDetector.markForCheck();
  }

  private _getServerBackups(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsServerBackupServerLog>> {
    return this._serverBackupsChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }
}
