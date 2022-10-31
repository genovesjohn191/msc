import { McsEntityBase } from '@app/models/common/mcs-entity.base';
import { JsonProperty } from '@app/utilities';

export class McsNetworkDnsService extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public isPrimary: boolean = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty()
  public zoneCount: number = undefined;
}
