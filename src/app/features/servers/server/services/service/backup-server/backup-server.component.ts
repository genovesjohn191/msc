import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  McsServerBackupServer,
  BackupStatus,
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
import { ServiceDetailViewBase } from '../service-detail-view.base';

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
export class ServiceBackupServerComponent extends ServiceDetailViewBase implements OnChanges {

  @Input()
  public set serverBackupServer(serverBackupServer: McsServerBackupServer) {
    this._serverBackupServer = serverBackupServer;
  }
  public get serverBackupServer(): McsServerBackupServer {
    return this._serverBackupServer;
  }

  private _backupServerStatusDetailsMap: Map<BackupStatus, BackupServerStatusDetails>;
  private _backupServerStatusDetails: BackupServerStatusDetails;
  private _serverBackupServer: McsServerBackupServer;

  constructor() {
    super(ServerServicesView.BackupServer);
    this._createStatusMap();
    this._backupServerStatusDetails = this._backupServerStatusDetailsMap.get(BackupStatus.NotStarted);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let serverBackupChange = changes['serverBackupServer'];
    if (!isNullOrEmpty(serverBackupChange)) {
      this._backupServerStatusDetails = this._backupServerStatusDetailsMap.get(this._serverBackupServer.status);
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
    return replacePlaceholder(
      this._backupServerStatusDetails.sublabel,
      ['lastBackupAttempt', 'startTime'],
      [this._serverBackupServer.lastBackupAttempt, this._serverBackupServer.startTime]
    );
  }

  public get statusDetailsLinkFlag(): boolean {
    return this._backupServerStatusDetails.detailsLinkFlag;
  }

  /**
   * Initializes the server backup status map
   */
  private _createStatusMap(): void {
    this._backupServerStatusDetailsMap = new Map();

    this._backupServerStatusDetailsMap.set(BackupStatus.Successful, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: backupServerStatusLabel[BackupStatus.Successful],
      sublabel: backupStatusSubtitleLabel[BackupStatus.Successful],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupStatus.Failed, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: backupServerStatusLabel[BackupStatus.Failed],
      sublabel: backupStatusSubtitleLabel[BackupStatus.Failed],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupStatus.InProgress, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: backupServerStatusLabel[BackupStatus.InProgress],
      sublabel: backupStatusSubtitleLabel[BackupStatus.InProgress],
      detailsLinkFlag: true
    });
    this._backupServerStatusDetailsMap.set(BackupStatus.NotStarted, {
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: backupServerStatusLabel[BackupStatus.NotStarted],
      sublabel: backupStatusSubtitleLabel[BackupStatus.NotStarted],
      detailsLinkFlag: false
    });
  }
}
