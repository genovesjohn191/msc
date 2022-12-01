import {
  McsEntityBase,
  McsStorageSaasBackupAttempt,
  McsStorageSaasBackupLastBackupAttempt
} from "@app/models";

import { JsonProperty } from "@app/utilities";

export class McsStorageSaasBackupBackupAttempt extends McsEntityBase {
  @JsonProperty({ target: McsStorageSaasBackupLastBackupAttempt })
  public lastBackupAttempt: McsStorageSaasBackupLastBackupAttempt = undefined;

  @JsonProperty({ target: McsStorageSaasBackupAttempt })
  public backupAttempts: McsStorageSaasBackupAttempt[] = undefined;
}