import { McsEntityBase } from "@app/models/common/mcs-entity.base";
import { SaasBackupStatus, SaasBackupStatusSerialization, saasBackupStatusText } from "@app/models/enumerations/storage/saas-backup-status.enum";
import { CommonDefinition, JsonProperty } from "@app/utilities";

export class McsStorageSaasBackupAttempt extends McsEntityBase {
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
  public startTime: Date = undefined;

  @JsonProperty()
  public endTime: Date = undefined;

  
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

  public get getStatusLabel(): string {
    return saasBackupStatusText[this.status] || 'Unknown';
  }
}