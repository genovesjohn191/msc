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
  McsServerBackupVmDetails,
  McsServerBackupVmLog
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
  selector: 'mcs-service-backup-vm-details',
  templateUrl: './backup-vm-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceBackupVmDetailsComponent implements OnChanges, OnDestroy {

  @Input()
  public serverId: string;

  public readonly vmBackupLogsDatasource: McsTableDataSource2<McsServerBackupVmLog>;
  public readonly vmBackupLogsColumns: McsFilterInfo[];

  private _vmBackupLogsCache: Observable<McsServerBackupVmLog[]>;
  private _vmBackupDetails: McsServerBackupVmDetails;
  private _vmBackupChange = new BehaviorSubject<McsServerBackupVmLog[]>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.vmBackupLogsDatasource = new McsTableDataSource2(this._getVmBackups.bind(this));
    this.vmBackupLogsColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'startDate' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'endDate' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'duration' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'mbModified' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'dataProtectionVolume' })
    ];
    this.vmBackupLogsDatasource.registerColumnsFilterInfo(this.vmBackupLogsColumns);
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
    return getSafeProperty(this._vmBackupDetails, (obj) => obj.inviewLevel) === InviewLevel.Premium;
  }

  public get retentionPeriod(): string {
    return getSafeProperty(this._vmBackupDetails, (obj) => obj.retentionPeriod, '');
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
   * Initializes the data source of the vm backup logs table
   */
  private _updateTableDataSource(serverid: string): void {
    let vmBackupApiSource: Observable<McsServerBackupVmLog[]>;
    if (!isNullOrEmpty(serverid)) {
      vmBackupApiSource = this._apiService.getServerBackupVmDetails(serverid).pipe(
        map((response) => {
          this._vmBackupDetails = response;
          return getSafeProperty(response, (obj) => obj.logs);
        }),
        tap((response) => {
          this._vmBackupLogsCache = of(response);
        })
      );
    }

    let tableDataSource = isNullOrEmpty(this._vmBackupLogsCache) ?
      vmBackupApiSource : this._vmBackupLogsCache;
    tableDataSource.subscribe(records => this._vmBackupChange.next(records || []));
    this._changeDetector.markForCheck();
  }

  private _getVmBackups(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsServerBackupVmLog>> {
    return this._vmBackupChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }
}
