

import {
  McsEntityBase,
  SaasBackupStatus,
  SaasBackupStatusSerialization,
  saasBackupStatusText
} from "@app/models";
import {
  CommonDefinition,
  JsonProperty
} from "@app/utilities";

export class McsStorageSaasBackupAttempt extends McsEntityBase {
  @JsonProperty({
    serializer: SaasBackupStatusSerialization,
    deserializer: SaasBackupStatusSerialization
  })
  public status: string = undefined;

  @JsonProperty()
  public protectedUsers: number = undefined;

  @JsonProperty()
  public runTime: Date = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public typeFriendlyName: string = undefined;

  @JsonProperty()
  public jobName: string = undefined;

  /**
   * Return the status icon key based on the status of the backup attempt
   */
   public get backupStatusStateIconKey(): string {
    let statusIconKey: string = '';

    switch (this.status) {
      case SaasBackupStatus.Failure:   // Red
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case SaasBackupStatus.PartialSuccess:     // Amber
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
    return saasBackupStatusText[this.status] || 'Never';
}

}