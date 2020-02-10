import {
  Component,
  Input,
  ChangeDetectorRef,
  SimpleChanges,
  OnInit,
  OnChanges
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { McsTableDataSource } from '@app/core';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import {
  McsServerBackupVmLog,
  McsServerBackupVmDetails,
  InviewLevel,
  BackupStatus,
  backupStatusLabel,
  backupStatusTypeMap,
  BackupStatusType,
  backupStatusTypeText
} from '@app/models';

@Component({
  selector: 'mcs-service-backup-vm-details',
  templateUrl: './backup-vm-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceBackupVmDetailsComponent implements OnInit, OnChanges {

  @Input()
  public serverId: string;

  public vmBackupLogsDatasource: McsTableDataSource<McsServerBackupVmLog>;
  public vmBackupLogsColumns: string[];

  private _vmBackupLogsCache: Observable<McsServerBackupVmLog[]>;
  private _vmBackupDetails: McsServerBackupVmDetails;

  constructor(
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.vmBackupLogsColumns = [];
    this.vmBackupLogsDatasource = new McsTableDataSource();
  }

  public ngOnInit(): void {
    this._setDataColumns();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let serverId = changes['serverId'];
    if (!isNullOrEmpty(serverId)) {
      this._updateTableDataSource(this.serverId);
    }
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
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.vmBackupLogsColumns = Object.keys(
      this._translateService.instant('serverServicesVmBackupDetails.columnHeaders')
    );
    if (isNullOrEmpty(this.vmBackupLogsColumns)) {
      throw new Error('column definition for VM Backup was not defined');
    }
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
    this.vmBackupLogsDatasource.updateDatasource(tableDataSource);
    this._changeDetector.markForCheck();
  }
}
