import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  BackupStatus,
  McsServerBackupVm,
  ServerServicesView,
  backupVmStatusLabel,
  backupStatusSubtitleLabel
} from '@app/models';
import {
  CommonDefinition,
  replacePlaceholder,
  isNullOrEmpty
} from '@app/utilities';
import { ServiceDetailViewBase } from '../service-detail-view.base';

type BackupVmStatusDetails = {
  icon: string;
  label: string;
  sublabel: string;
  detailsLinkFlag: boolean;
};

@Component({
  selector: 'mcs-service-backup-vm',
  templateUrl: './backup-vm.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceBackupVmComponent extends ServiceDetailViewBase implements OnChanges {

  @Input()
  public set serverBackupVm(serverBackupVm: McsServerBackupVm) {
    this._serverBackupVm = serverBackupVm;
  }
  public get serverBackupVm(): McsServerBackupVm {
    return this._serverBackupVm;
  }

  private _backupVmStatusDetailsMap: Map<BackupStatus, BackupVmStatusDetails>;
  private _backupVmStatusDetails: BackupVmStatusDetails;
  private _serverBackupVm: McsServerBackupVm;

  constructor() {
    super(ServerServicesView.BackupVm);
    this._createStatusMap();
    this._backupVmStatusDetails = this._backupVmStatusDetailsMap.get(BackupStatus.NotStarted);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let vmBackupChange = changes['serverBackupVm'];
    if (!isNullOrEmpty(vmBackupChange)) {
      this._backupVmStatusDetails = this._backupVmStatusDetailsMap.get(this._serverBackupVm.status);
    }
  }

  public get statusIcon(): string {
    return this._backupVmStatusDetails.icon;
  }

  public get statusLabel(): string {
    return this._backupVmStatusDetails.label;
  }

  public get statusSublabel(): string {
    return replacePlaceholder(
      this._backupVmStatusDetails.sublabel,
      ['lastBackupAttempt', 'startTime'],
      [this._serverBackupVm.lastBackupAttempt, this._serverBackupVm.startTime]
    );
  }

  public get statusDetailsLinkFlag(): boolean {
    return this._backupVmStatusDetails.detailsLinkFlag;
  }

  /**
   * Initializes the vm backup status map
   */
  private _createStatusMap(): void {
    this._backupVmStatusDetailsMap = new Map();

    this._backupVmStatusDetailsMap.set(BackupStatus.Successful, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: backupVmStatusLabel[BackupStatus.Successful],
      sublabel: backupStatusSubtitleLabel[BackupStatus.Successful],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupStatus.Failed, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: backupVmStatusLabel[BackupStatus.Failed],
      sublabel: backupStatusSubtitleLabel[BackupStatus.Failed],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupStatus.InProgress, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: backupVmStatusLabel[BackupStatus.InProgress],
      sublabel: backupStatusSubtitleLabel[BackupStatus.InProgress],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupStatus.NotStarted, {
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: backupVmStatusLabel[BackupStatus.NotStarted],
      sublabel: backupStatusSubtitleLabel[BackupStatus.NotStarted],
      detailsLinkFlag: false
    });
  }
}
