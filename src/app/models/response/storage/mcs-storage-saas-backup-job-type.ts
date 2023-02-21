import { McsStorageSaasBackupJobTypeLastBackupAttempt } from "@app/models";

import { JsonProperty } from "@app/utilities";

export class McsStorageSaasBackupJobType {
  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public typeFriendlyName: string = undefined;

  @JsonProperty()
  public dailySchedule: string[] = undefined;

  @JsonProperty({ target: McsStorageSaasBackupJobTypeLastBackupAttempt })
  public lastBackupAttempt: McsStorageSaasBackupJobTypeLastBackupAttempt = undefined;

  @JsonProperty()
  public hasActiveJob: boolean = false;
}