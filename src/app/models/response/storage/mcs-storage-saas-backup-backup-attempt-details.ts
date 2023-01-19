import {
  McsEntityBase,
  McsStorageSaasBackupUsers,
  SaasBackupGeneralStatusSerialization,
  saasBackupGeneralStatusText
} from "@app/models";

import { JsonProperty } from "@app/utilities";

export class McsStorageSaasBackupBackupAttemptDetails extends McsEntityBase {
  @JsonProperty({
    serializer: SaasBackupGeneralStatusSerialization,
    deserializer: SaasBackupGeneralStatusSerialization
  })
  public generalStatus: string = undefined;

  @JsonProperty()
  public protectedUsers: number = undefined;

  @JsonProperty()
  public startTime: Date = undefined;

  @JsonProperty()
  public endTime: Date = undefined;

  @JsonProperty({ target: McsStorageSaasBackupUsers })
  public users: McsStorageSaasBackupUsers[] = undefined;

  public get generalStatusLabel(): string {
    return saasBackupGeneralStatusText[this.generalStatus] || 'Never';
  }
}