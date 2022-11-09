import { McsEntityBase } from "@app/models/common/mcs-entity.base";
import { JsonProperty } from "@app/utilities";
import { McsStorageSaasBackupAttempt } from "./mcs-storage-saas-backup-attempt";

export class McsStorageSaasBackup extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public seatQuantity: number = undefined;

  @JsonProperty()
  public licensedUserQuantity: number = undefined;

  @JsonProperty()
  public unlicensedUserQuantity: number = undefined;

  @JsonProperty()
  public tenantDomain: string = undefined;

  @JsonProperty()
  public tenantName: string = undefined;

  @JsonProperty()
  public portalUrl: string = undefined;

  @JsonProperty()
  public lastBackupAttempt: McsStorageSaasBackupAttempt = undefined;

  @JsonProperty()
  public dailySchedule: string[] = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;
}