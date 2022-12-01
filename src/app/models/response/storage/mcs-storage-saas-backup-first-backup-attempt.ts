import { JsonProperty } from "@app/utilities";

export class McsStorageSaasBackupFirstBackupAttempt {
  @JsonProperty()
  public runTime: Date = undefined;
}