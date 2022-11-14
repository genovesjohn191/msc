import {
  SaasBackupType,
  SaasBackupTypeSerialization,
  saasBackupTypeText
} from "@app/models";
import { McsEntityBase } from "@app/models/common/mcs-entity.base";
import { JsonProperty } from "@app/utilities";
import { McsStorageSaasBackupAttempt } from "./mcs-storage-saas-backup-attempt";
import { McsStorageSaasBackupComponentOnlineStatus } from "./mcs-storage-saas-backup-component-online-status";

export class McsStorageSaasBackup extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty({
    serializer: SaasBackupTypeSerialization,
    deserializer: SaasBackupTypeSerialization
  })
  public type: SaasBackupType = undefined;

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

  @JsonProperty({ target: McsStorageSaasBackupAttempt })
  public lastBackupAttempt: McsStorageSaasBackupAttempt = undefined;

  @JsonProperty()
  public dailySchedule: string[] = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty({ target: McsStorageSaasBackupComponentOnlineStatus })
  public componentOnlineStatus: McsStorageSaasBackupComponentOnlineStatus = undefined;

  /**
   * Returns the saas type text content
   */
  public get typeLabel(): string {
    let isTypeMicrosoft365 = this.type === SaasBackupType.M365;
    return isTypeMicrosoft365 ? saasBackupTypeText[SaasBackupType.M365] : 'Other';
  }
}