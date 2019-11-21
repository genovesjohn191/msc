import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  McsServerBackupServer,
  BackupAttemptStatus,
  backupServerStatusLabel,
  backupStatusSubtitleLabel,
  ServerServicesView
} from '@app/models';
import {
  CommonDefinition,
  replacePlaceholder,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { ServerServiceDetailBase } from '../server-service-detail.base';

type BackupServerStatusDetails = {
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
export class ServiceBackupServerComponent extends ServerServiceDetailBase implements OnChanges {

  @Input()
  public set serverBackupServer(serverBackupServer: McsServerBackupServer) {
    this._serverBackupServer = serverBackupServer;
  }
  public get serverBackupServer(): McsServerBackupServer {
    return this._serverBackupServer;
  }

  private _backupServerStatusDetailsMap: Map<BackupAttemptStatus, BackupServerStatusDetails>;
  private _backupServerStatusDetails: BackupServerStatusDetails;
  private _serverBackupServer: McsServerBackupServer;

  constructor() {
    super(ServerServicesView.BackupServer);
    this._createStatusMap();
    this._backupServerStatusDetails = this._backupServerStatusDetailsMap.get(BackupAttemptStatus.NotStarted);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let serverBackupChange = changes['serverBackupServer'];
    if (!isNullOrEmpty(serverBackupChange)) {
      this._backupServerStatusDetails = this._backupServerStatusDetailsMap.get(this._serverBackupServer.lastBackupAttempt.status);
    }
  }


  public get isProvisioned(): boolean {
    return getSafeProperty(this._serverBackupServer, (obj) => obj.provisioned, false);
  }

  public get statusIcon(): string {
    return this._backupServerStatusDetails.icon;
  }

  public get statusLabel(): string {
    return this._backupServerStatusDetails.label;
  }

  public get statusSublabel(): string {
    return replacePlaceholder(this._backupServerStatusDetails.sublabel, 'startTime', this._serverBackupServer.lastBackupAttempt.startedOn);
  }

  public get statusDetailsLinkFlag(): boolean {
    return this._backupServerStatusDetails.detailsLinkFlag;
  }

  /**
   * Initializes the server backup status map
   */
  private _createStatusMap(): void {
    this._backupServerStatusDetailsMap = new Map();

    this._backupServerStatusDetailsMap.set(BackupAttemptStatus.Successful, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: backupServerStatusLabel[BackupAttemptStatus.Successful],
      sublabel: backupStatusSubtitleLabel[BackupAttemptStatus.Successful],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupAttemptStatus.Failed, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: backupServerStatusLabel[BackupAttemptStatus.Failed],
      sublabel: backupStatusSubtitleLabel[BackupAttemptStatus.Failed],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupAttemptStatus.InProgress, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: backupServerStatusLabel[BackupAttemptStatus.InProgress],
      sublabel: backupStatusSubtitleLabel[BackupAttemptStatus.InProgress],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupAttemptStatus.NotStarted, {
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: backupServerStatusLabel[BackupAttemptStatus.NotStarted],
      sublabel: backupStatusSubtitleLabel[BackupAttemptStatus.NotStarted],
      detailsLinkFlag: false
    });
  }
}
