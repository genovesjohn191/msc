import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  OnInit
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  McsServerBackupServer,
  backupStatusTypeSubtitleLabel,
  ServerServicesView,
  BackupStatusType,
  backupStatusTypeMap,
  backupServerStatusTypeLabel,
  backupStatusLabel,
  McsServer,
  ServerServicesAction,
  ServerProvisionState
} from '@app/models';
import {
  CommonDefinition,
  replacePlaceholder,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { McsDateTimeService } from '@app/core';
import { ServerServiceDetailBase } from '../server-service-detail.base';
import { ServerServiceActionDetail } from '../../strategy/server-service-action.context';

// TODO: Extract this when the generic date time service is created
const BACKUP_TIMEZONE = 'Australia/Sydney';
const BACKUP_DATEFORMAT = `EEEE, d MMMM, yyyy 'at' h:mm a`;

type BackupServerStatusDetails = {
  status: BackupStatusType;
  icon: string;
  label: string;
  sublabel: string;
  detailsLinkFlag: boolean;
};

@Component({
  selector: 'mcs-service-backup-server',
  templateUrl: './backup-server.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceBackupServerComponent extends ServerServiceDetailBase implements OnChanges, OnInit {

  @Input()
  public set serverBackupServer(serverBackupServer: McsServerBackupServer) {
    this._serverBackupServer = serverBackupServer;
  }
  public get serverBackupServer(): McsServerBackupServer {
    return this._serverBackupServer;
  }

  @Output()
  public addServerBackup: EventEmitter<ServerServiceActionDetail>;

  private _backupServerStatusDetailsMap: Map<BackupStatusType, BackupServerStatusDetails>;
  private _backupServerStatusDetails: BackupServerStatusDetails;
  private _serverBackupServer: McsServerBackupServer;
  private _serverBackupProvisionMessageBitMap = new Map<number, string>();

  constructor(
    private _dateTimeService: McsDateTimeService,
    private _translate: TranslateService
  ) {
    super(ServerServicesView.BackupServer);
    this.addServerBackup = new EventEmitter();
    this._createStatusMap();
    this._backupServerStatusDetails = this._backupServerStatusDetailsMap.get(BackupStatusType.NeverAttempted);
  }

  public ngOnInit() {
    this._registerProvisionStateBitmap();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let serverBackupChange = changes['serverBackupServer'];
    if (!isNullOrEmpty(serverBackupChange)) {
      let statusType: BackupStatusType = backupStatusTypeMap[this._serverBackupServer.lastBackupAttempt.status];
      this._backupServerStatusDetails = this._backupServerStatusDetailsMap.get(statusType);
    }
  }

  public get statusIcon(): string {
    return getSafeProperty(this._backupServerStatusDetails, (obj) => obj.icon);
  }

  public get statusLabel(): string {
    return getSafeProperty(this._backupServerStatusDetails, (obj) => obj.label);
  }

  public get isStatusUnknown(): boolean {
    return getSafeProperty(this._backupServerStatusDetails, (obj) => obj.status) === BackupStatusType.Unknown;
  }

  public get statusTooltip(): string {
    return getSafeProperty(this._serverBackupServer, (obj) => backupStatusLabel[obj.lastBackupAttempt.status]);
  }

  public get statusSublabel(): string {
    let startTime = this._dateTimeService.formatDate(
      this._serverBackupServer.lastBackupAttempt.startedOn,
      BACKUP_DATEFORMAT,
      BACKUP_TIMEZONE
    );
    return getSafeProperty(this._backupServerStatusDetails, (obj) => replacePlaceholder(obj.sublabel, 'formattedDate', startTime));
  }

  public get statusDetailsLinkFlag(): boolean {
    return getSafeProperty(this._backupServerStatusDetails, (obj) => obj.detailsLinkFlag);
  }

  public disableMessage(server: McsServer): string {
    if (isNullOrEmpty(server)) { return; }
    return this._serverBackupProvisionMessageBitMap.get(server.provisionStatusBit);
  }

  public onAddServerBackup(selectedServer: McsServer): void {
    this.addServerBackup.emit({
      action: ServerServicesAction.AddServerBackup,
      server: selectedServer
    });
  }

  private _registerProvisionStateBitmap(): void {
    this._serverBackupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff,
      this._translate.instant('serverServices.serverBackup.poweredOff')
    );

    this._serverBackupProvisionMessageBitMap.set(
      ServerProvisionState.ServiceAvailableFalse,
      this._translate.instant('serverServices.serverBackup.provisioning')
    );

    this._serverBackupProvisionMessageBitMap.set(
      ServerProvisionState.isProcessing,
      this._translate.instant('serverServices.serverBackup.processing')
    );
  }

  /**
   * Initializes the server backup status map
   */
  private _createStatusMap(): void {
    this._backupServerStatusDetailsMap = new Map();

    this._backupServerStatusDetailsMap.set(BackupStatusType.Successful, {
      status: BackupStatusType.Successful,
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: backupServerStatusTypeLabel[BackupStatusType.Successful],
      sublabel: backupStatusTypeSubtitleLabel[BackupStatusType.Successful],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupStatusType.Failed, {
      status: BackupStatusType.Failed,
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: backupServerStatusTypeLabel[BackupStatusType.Failed],
      sublabel: backupStatusTypeSubtitleLabel[BackupStatusType.Failed],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupStatusType.InProgress, {
      status: BackupStatusType.InProgress,
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: backupServerStatusTypeLabel[BackupStatusType.InProgress],
      sublabel: backupStatusTypeSubtitleLabel[BackupStatusType.InProgress],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupStatusType.NeverAttempted, {
      status: BackupStatusType.NeverAttempted,
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: backupServerStatusTypeLabel[BackupStatusType.NeverAttempted],
      sublabel: backupStatusTypeSubtitleLabel[BackupStatusType.NeverAttempted],
      detailsLinkFlag: false
    });
  }
}
