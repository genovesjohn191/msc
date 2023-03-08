

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
  public generalStatus: string = undefined;

  @JsonProperty()
  public startTime: Date = undefined;

  @JsonProperty()
  public endTime: Date = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public typeFriendlyName: string = undefined;

  @JsonProperty()
  public jobName: string = undefined;

  /**
   * Return the general status icon key based on the status of the backup attempt
   */
   public get backupGeneralStatusStateIconKey(): string {
    let statusIconKey: string = '';

    switch (this.generalStatus) {
      case SaasBackupStatus.Failure:   // Red
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case SaasBackupStatus.PartialSuccess:
      case SaasBackupStatus.Warning:     // Amber
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case SaasBackupStatus.Success:    // Green
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      default: // Grey
      statusIconKey = CommonDefinition.ASSETS_SVG_STATE_SUSPENDED;
        break;
    }
    return statusIconKey;
  }

  public get generalStatusLabel(): string {
    return saasBackupStatusText[this.generalStatus] || 'Unknown';
}

}