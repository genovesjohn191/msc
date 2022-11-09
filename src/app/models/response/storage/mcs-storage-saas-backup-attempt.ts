import { McsEntityBase } from "@app/models/common/mcs-entity.base";
import { JsonProperty } from "@app/utilities";

export class McsStorageSaasBackupAttempt extends McsEntityBase {
  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public sucessfulUsers: string = undefined;

  @JsonProperty()
  public failedUsers: string = undefined;

  @JsonProperty()
  public startTime: Date = undefined;

  @JsonProperty()
  public endTime: Date = undefined;
}