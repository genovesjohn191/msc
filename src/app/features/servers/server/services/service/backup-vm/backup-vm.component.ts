import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  BackupAttemptStatus,
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
import { McsDateTimeService } from '@app/core';
import { ServerServiceDetailBase } from '../server-service-detail.base';

// TODO: Extract this when the generic date time service is created
const BACKUP_TIMEZONE = 'Australia/Sydney';
const BACKUP_DATEFORMAT = `EEEE, d MMMM, yyyy 'at' h:mm a`;

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
export class ServiceBackupVmComponent extends ServerServiceDetailBase implements OnChanges {

  @Input()
  public set serverBackupVm(serverBackupVm: McsServerBackupVm) {
    this._serverBackupVm = serverBackupVm;
  }
  public get serverBackupVm(): McsServerBackupVm {
    return this._serverBackupVm;
  }

  private _backupVmStatusDetailsMap: Map<BackupAttemptStatus, BackupVmStatusDetails>;
  private _backupVmStatusDetails: BackupVmStatusDetails;
  private _serverBackupVm: McsServerBackupVm;

  constructor(private _dateTimeService: McsDateTimeService) {
    super(ServerServicesView.BackupVm);
    this._createStatusMap();
    this._backupVmStatusDetails = this._backupVmStatusDetailsMap.get(BackupAttemptStatus.NeverAttempted);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let vmBackupChange = changes['serverBackupVm'];
    if (!isNullOrEmpty(vmBackupChange)) {
      this._backupVmStatusDetails = this._backupVmStatusDetailsMap.get(this._serverBackupVm.lastBackupAttempt.status);
    }
  }

  public get statusIcon(): string {
    return this._backupVmStatusDetails.icon;
  }

  public get statusLabel(): string {
    return this._backupVmStatusDetails.label;
  }

  public get statusSublabel(): string {
    let startTime = this._dateTimeService.formatDate(
      this._serverBackupVm.lastBackupAttempt.startedOn,
      BACKUP_DATEFORMAT,
      BACKUP_TIMEZONE
    );
    return replacePlaceholder(this._backupVmStatusDetails.sublabel, 'formattedDate', startTime);
  }

  public get statusDetailsLinkFlag(): boolean {
    return this._backupVmStatusDetails.detailsLinkFlag;
  }

  /**
   * Initializes the vm backup status map
   */
  private _createStatusMap(): void {
    this._backupVmStatusDetailsMap = new Map();

    this._backupVmStatusDetailsMap.set(BackupAttemptStatus.Successful, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: backupVmStatusLabel[BackupAttemptStatus.Successful],
      sublabel: backupStatusSubtitleLabel[BackupAttemptStatus.Successful],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupAttemptStatus.Failed, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: backupVmStatusLabel[BackupAttemptStatus.Failed],
      sublabel: backupStatusSubtitleLabel[BackupAttemptStatus.Failed],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupAttemptStatus.InProgress, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: backupVmStatusLabel[BackupAttemptStatus.InProgress],
      sublabel: backupStatusSubtitleLabel[BackupAttemptStatus.InProgress],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupAttemptStatus.NeverAttempted, {
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: backupVmStatusLabel[BackupAttemptStatus.NeverAttempted],
      sublabel: backupStatusSubtitleLabel[BackupAttemptStatus.NeverAttempted],
      detailsLinkFlag: false
    });
  }
}
