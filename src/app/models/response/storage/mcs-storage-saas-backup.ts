import {
  McsEntityBase,
  McsStorageSaasBackupComponentOnlineStatus,
  McsStorageSaasBackupJobType,
  SaasBackupType,
  SaasBackupTypeSerialization,
  saasBackupTypeText
} from "@app/models";

import { JsonProperty } from "@app/utilities";

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

  @JsonProperty({ target: McsStorageSaasBackupJobType })
  public jobTypes: McsStorageSaasBackupJobType = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty({ target: McsStorageSaasBackupComponentOnlineStatus })
  public componentOnlineStatus: McsStorageSaasBackupComponentOnlineStatus = undefined;


  /**
   * Returns the SaaS type text content
   */
  public get typeLabel(): string {
    let isTypeMicrosoft365 = this.type === SaasBackupType.M365;
    return isTypeMicrosoft365 ? saasBackupTypeText[SaasBackupType.M365] : 'Other';
  }
}
