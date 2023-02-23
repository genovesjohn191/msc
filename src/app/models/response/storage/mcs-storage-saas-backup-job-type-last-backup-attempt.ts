import {
  SaasBackupStatus,
  SaasBackupStatusSerialization,
  saasBackupStatusText
} from "@app/models";

import {
  CommonDefinition,
  JsonProperty
} from "@app/utilities";

export class McsStorageSaasBackupJobTypeLastBackupAttempt {
  @JsonProperty({
    serializer: SaasBackupStatusSerialization,
    deserializer: SaasBackupStatusSerialization
  })
  public status: string = undefined;
  
  @JsonProperty()
  public runTime: Date = undefined;

  /**
   * Return the status icon key based on the status of the backup attempt
   */
  public get backupStatusStateIconKey(): string {
    let statusIconKey: string = '';

    switch (this.status) {
      case SaasBackupStatus.Failure:   // Red
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case SaasBackupStatus.PartialSuccess:
      case SaasBackupStatus.Warning:     // Amber
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

  public get statusLabel(): string {
    return saasBackupStatusText[this.status] || 'Never Attempted';
}

}