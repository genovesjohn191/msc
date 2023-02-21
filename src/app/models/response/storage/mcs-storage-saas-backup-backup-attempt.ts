import {
  McsEntityBase,
  McsStorageSaasBackupAttempt,
  McsStorageSaasBackupJobType
} from "@app/models";

import { JsonProperty } from "@app/utilities";

export class McsStorageSaasBackupBackupAttempt extends McsEntityBase {
  @JsonProperty({ target: McsStorageSaasBackupJobType })
  public jobTypes: McsStorageSaasBackupJobType[] = undefined;

  @JsonProperty({ target: McsStorageSaasBackupAttempt })
  public backupAttempts: McsStorageSaasBackupAttempt[] = undefined;
}