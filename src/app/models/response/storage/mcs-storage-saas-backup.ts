import { McsEntityBase } from "@app/models/common/mcs-entity.base";
import { JsonProperty } from "@app/utilities";

export class McsStorageSaasBackup extends McsEntityBase {

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

}