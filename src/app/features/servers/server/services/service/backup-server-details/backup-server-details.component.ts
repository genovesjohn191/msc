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
  InviewLevel,
  BackupStatus,
  backupStatusLabel,
  backupStatusTypeMap,
  BackupStatusType,
  backupStatusTypeText,
  McsServerBackupServerLog,
  McsServerBackupServerDetails
} from '@app/models';

@Component({
  selector: 'mcs-service-backup-server-details',
  templateUrl: './backup-server-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceBackupServerDetailsComponent implements OnInit, OnChanges {

  @Input()
  public serverId: string;

  public serverBackupLogsDatasource: McsTableDataSource<McsServerBackupServerLog>;
  public serverBackupLogsColumns: string[];

  private _serverBackupLogsCache: Observable<McsServerBackupServerLog[]>;
  private _serverBackupDetails: McsServerBackupServerDetails;

  constructor(
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.serverBackupLogsColumns = [];
    this.serverBackupLogsDatasource = new McsTableDataSource();
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
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.serverBackupLogsColumns = Object.keys(
      this._translateService.instant('serverServicesServerBackupDetails.columnHeaders')
    );
    if (isNullOrEmpty(this.serverBackupLogsColumns)) {
      throw new Error('column definition for Server Backup was not defined');
    }
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
    this.serverBackupLogsDatasource.updateDatasource(tableDataSource);
    this._changeDetector.markForCheck();
  }
}
