import {
  McsEntityBase,
  SaasBackupGeneralStatus,
  SaasBackupGeneralStatusSerialization,
  saasBackupGeneralStatusText,
  SaasBackupStatus,
  SaasBackupStatusSerialization,
  saasBackupStatusText
} from "@app/models";

import {
  CommonDefinition,
  JsonProperty
} from "@app/utilities";

export class McsStorageSaasBackupLastBackupAttempt extends McsEntityBase {
  @JsonProperty({
    serializer: SaasBackupStatusSerialization,
    deserializer: SaasBackupStatusSerialization
  })
  public status: string = undefined;

  @JsonProperty()
  public successfulUsers: number = undefined;

  @JsonProperty()
  public failedUsers: number = undefined;

  @JsonProperty()
  public runTime: Date = undefined;

  @JsonProperty({
    serializer: SaasBackupGeneralStatusSerialization,
    deserializer: SaasBackupGeneralStatusSerialization
  })
  public generalStatus: string = undefined;

  public get generalStatusLabel(): string {
    return saasBackupGeneralStatusText[this.generalStatus] || 'Never';
  }

  /**
   * Return the status icon key based on the general status of the last backup attempt
   */
  public get backupGeneralStatusStateIconKey(): string {
    let statusIconKey: string = '';

    switch (this.generalStatus) {
      case SaasBackupGeneralStatus.Failure:   // Red
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case SaasBackupGeneralStatus.PartialSuccess:     // Amber
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case SaasBackupStatus.Running:    // Green
      case SaasBackupStatus.Success:    
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      default: // Grey
      statusIconKey = CommonDefinition.ASSETS_SVG_STATE_SUSPENDED;
        break;
    }
    return statusIconKey;
  }

  /**
   * Return the status icon key based on the status of the last backup attempt
   */
  public get backupStatusStateIconKey(): string {
    let statusIconKey: string = '';

    switch (this.status) {
      case SaasBackupStatus.Stopped:   // Red
      case SaasBackupStatus.Failed:
      case SaasBackupStatus.Disconnected:
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case SaasBackupStatus.Warning:     // Amber
      case SaasBackupStatus.NotConfigured:
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case SaasBackupStatus.Running:    // Green
      case SaasBackupStatus.Success:    
      case SaasBackupStatus.Queued:
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      default: // Grey
      statusIconKey = CommonDefinition.ASSETS_SVG_STATE_SUSPENDED;
        break;
    }
    return statusIconKey;
  }

  public get statusLabel(): string {
    return saasBackupStatusText[this.status] || 'Unknown';
}

  public get totalBackupAttempts(): number {
    let successfulAttempts = this.successfulUsers || 0;
    let failedAttempts = this.failedUsers || 0; 
    return successfulAttempts + failedAttempts;
  }
}