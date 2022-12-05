
import {
  SaasBackupUserStatus,
  SaasBackupUserStatusSerialization,
  saasBackupUserStatusText
} from "@app/models";
import {
  CommonDefinition,
  JsonProperty
} from "@app/utilities";

export class McsStorageSaasBackupUsers {
  @JsonProperty()
  public username: string = undefined;

  @JsonProperty({
    serializer: SaasBackupUserStatusSerialization,
    deserializer: SaasBackupUserStatusSerialization
  })
  public status: string = undefined;

  public get userStatusLabel(): string {
    return saasBackupUserStatusText[this.status] || 'Unknown';
  }

  /**
   * Return the status icon key based on the backup status of the user
   */
  public get userStatusStateIconKey(): string {
    let statusIconKey: string = '';

    switch (this.status) {
      case SaasBackupUserStatus.Unprotected:   // Red
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case SaasBackupUserStatus.Protected:    
        statusIconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      default: // Grey
      statusIconKey = CommonDefinition.ASSETS_SVG_STATE_SUSPENDED;
        break;
    }
    return statusIconKey;
  }
}